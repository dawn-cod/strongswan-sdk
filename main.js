// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1350,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const ipcMain = require('electron').ipcMain;
const fs = require('fs')
const exec = require('child_process').exec;
const cmdPath = process.cwd();
const configPath = "/usr/local/etc/swanctl/conf.d/swanctl.conf";

//该函数用于执行命令()
function execCommend_Raw(commend, cmdir = cmdPath){
  const runExec = new Promise((resolve, reject) => {
    let res = '', err = '';
    // 执行命令行，如果命令不需要路径 ，或就是项目根目录，则不需要cwd参数：
    // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
    workerProcess = exec(commend, { cwd: cmdir })
    // 打印正常的后台可执行程序输出
    workerProcess.stdout.on('data', function (data) {
      res += data;
    });
    // 打印错误的后台可执行程序输出
    workerProcess.stderr.on('data', function (data) {
      console.error(data);
      err += data;
    });
    // 退出之后的输出
    workerProcess.on('close', function (code) {
      console.log('out code：' + code);
      if (code === 0) {
        resolve({ err, res });
      } else {
        reject(code);
      }
    });
  });
  return runExec;
}
//在execCommend_Raw的基础上添加了回显和报错
function execCommend(commend){
  var runExec_start = execCommend_Raw(commend)
  runExec_start.then(({ err, res }) => {
    e.sender.send('msg-reply', res);
  }).catch((err) => {
    console.error(err);
  });
  return runExec_start
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  var runExec_start = execCommend_Raw('sudo ipsec stop')
  runExec_start.then(({ err, res }) => {
    console.log('ipsec sudo stop res:\n', res);
    if (process.platform !== 'darwin') app.quit()
  }).catch((err) => {
    console.error(err);
    if (process.platform !== 'darwin') app.quit()
  });
})

//Specific Parses Functions
function parseConfig(configStr){
  console.log(configStr);
  const configObj = {};
  let currentObj = configObj;
  const lines = configStr.replace(/#.*/g,'').split('\n');
  let stack = [];
  
  for (let line of lines) {
    line = line.trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    } else if (line.endsWith('{')) {
      stack.push(currentObj)
      let KEYwithobj = line.match(/(\w|-)+(?=\s*{)/g);
      currentObj[KEYwithobj] = {};
      currentObj = currentObj[KEYwithobj];
    } else if (line === '}') {
      currentObj = stack.pop();
    } else {
      //处理键值对
      let [key, val] = line.split('=').map(item => item.trim());
      currentObj[key] = val;
    }
  }
  return configObj;
}

//Specific Stringify Functions
function stringifyConfig(obj) {
  const indent = "   ";
  let result = "";

  function buildString(val, depth) {
    if (typeof val === "object" && !Array.isArray(val)) {
      // Object keys should be sorted alphabetically
      const keys = Object.keys(val).sort();
      for (const key of keys) {
        const value = val[key];
        if (typeof value === "object") {
          result += indent.repeat(depth) + key + " {\n";
          buildString(value, depth + 1);
          result += indent.repeat(depth) + "}\n";
        } else {
          result += indent.repeat(depth) + key + " = " + value + "\n";
        }
      }
    } else if (Array.isArray(val)) {
      for (const value of val) {
        buildString(value, depth);
      }
    }
  }

  buildString(obj, 0);
  return result;
}

//保存配置信息至本地
ipcMain.on('save_config', async (event, msg) => {
  // console.log("msg is: \n", msg);
  fs.readFile(path.join(configPath),"utf8",(err,data)=>{
    // console.log("====Raw config is====: \n", data, "\n============\n");
    if(err){
      event.sender.send('read-file-reply', "Failure occurs when reading file");
    }else{
      event.sender.send('read-file-reply', data);
    }
    configobject = parseConfig(data);
    configobject.connections.h2h.local_addrs = msg.LocalIP;
    configobject.connections.h2h.remote_addrs = msg.RemoteIP;
    configobject.connections.h2h.local.id = msg.LocalID;
    configobject.connections.h2h.remote.id = msg.RemoteID;
    configobject.connections.h2h.children.h2h_child.rekey_time = msg.reconnectGapSecond;
    configstring = stringifyConfig(configobject);
    //write config to file
    fs.writeFile(path.join(configPath), configstring, 
    {
      encoding: "utf8",
      flag: "w"
    },
    (err)=>{
      if(err){
        event.sender.send('write-file-reply', "Failure occurs when writing file");
      }else{
        event.sender.send('write-file-reply', "Success");
        console.log("write-file-reply");
      }
    });
    })
});


//启动StrongSwan
ipcMain.on('startStrongSwan', async (event, startTime) => {
  var runExec_start = execCommend_Raw('sudo ipsec start')
  runExec_start.then(({ err, res }) => {
    event.sender.send('msg-reply', res);
  }).catch((err) => {
    console.error(err);
  });
  var runExec_start = execCommend_Raw('sudo swanctl --load-all')
  runExec_start.then(({ err, res }) => {
    event.sender.send('msg-reply', res);
  }).catch((err) => {
    console.error(err);
  });
  // if starttime is not provided, it'll start at 10 sec latter when press the button.
  var waitingtime;
  if(startTime == "Invalid Date"){
    waitingtime = 10000;
  }else{
    waitingtime = startTime - new Date();
  }
  setTimeout(() => {
    console.log('starting connection...')
    var runExec_start = execCommend_Raw('sudo ipsec up h2h')
    runExec_start.then(({ err, res }) => {
      event.sender.send('msg-reply', res);
    }).catch((err) => {
      console.error(err);
    });
    }, waitingtime)
})

