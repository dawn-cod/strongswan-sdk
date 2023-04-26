// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      conconfigStringIsolation: false,
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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const ipcMain = require('electron').ipcMain;
const fs = require('fs')
const exec = require('child_process').exec;
const cmdPath = '/home/edward/桌面/NJUPT-NEXUS';

//该函数用于执行命令
function execCommend_Raw(commend){
  const runExec = new Promise((resolve, reject) => {
    let res = '', err = '';
    // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
    // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
    workerProcess = exec(commend, { cwd: cmdPath })
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
//parser 重写
function parseConfig(configString) {
  configString = String(configString)
  function commentClear(str){
    return str.replace(/#.+/g,"")
  }
  const configStringWithoutComment = commentClear(configString);
  const lines = configStringWithoutComment.split('\n');
  return lines

  let result = {};
  let currentObject = result;
  let currentKey = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (line === "" || line.startsWith("#")) {
      continue;
    }

    // Check for opening and closing braces
    if (line.endsWith("{")) {
      const key = line.slice(0, -1).trim();
      currentKey = key;
      currentObject[key] = {};
      currentObject = currentObject[key];
    } else if (line === "}") {
      currentObject = result;
      currentKey = null;
    } else {
      // Parse key-value pairs
      const [key, value] = line.split("=");
      if (!key || !value) {
        throw new SyntaxError(`Invalid key-value pair: ${line}`);
      }

      // Trim whitespace from keys and values
      const trimmedKey = key.trim();
      const trimmedValue = value.trim();

      // Parse values as booleans or numbers if possible
      let parsedValue = trimmedValue;
      if (trimmedValue === "true") {
        parsedValue = true;
      } else if (trimmedValue === "false") {
        parsedValue = false;
      } else if (!isNaN(trimmedValue)) {
        parsedValue = parseFloat(trimmedValue);
      }

      // Set the key-value pair on the current object
      if (currentKey === null) {
        throw new SyntaxError(`No object to set key-value pair: ${line}`);
      }
      currentObject[trimmedKey] = parsedValue;
    }
  }

  return result;
}

//正则识别IP（配置修改方式一）
function regLocalIp(string){
    return string.match(/(?<=local_addrs\D+)((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g);
}
function regRemoteIp(string){
    return string.match(/(?<=remote_addrs\D+)((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g);
}
//json解析（配置修改方式二）
function jsonModify(config){
  config.replace(/#.+/g,"")
}
//保存配置信息至本地
ipcMain.on('save_config', async (event, msg) => {
  console.log('[save_config] main: ' + msg.localID);
  fs.readFile(path.join(__dirname,"./test.txt"),"utf8",(err,data)=>{
    if(err){
      event.sender.send('read-file-reply', "Failure occurs when reading file");
    }else{
      event.sender.send('read-file-reply', data);
    }
    //测试
    function jsonModify(str){
      function commentClear(str){
        return str.replace(/#.+/g,"")
      }
      function addComma(data){
        var passage = data.split("\n")
        let words_addcomma = [];
        for (var words of passage){
          let flag = 0;
          for(var letter of words){
            if(letter == "{"){flag = 1}
          }
          if (flag == 0){
            words = words.concat(words + ",");
            console.log(words);
          }
          words_addcomma.push(words);
        }
        return words_addcomma.join('\n')
      }
      const commentless = commentClear(str)
      const withquotas = commentless.replace(/(\w|\.|-|\/)(\w|\.|-|\/|^=|\x20)*(\w|\.|-|\/)|\d/g, "\""+"$&"+"\"")
      const withcolon = withquotas.replace(/{/g, ":"+"$&").replace(/=/g, ":")
      const withcomma = addComma(withcolon)
      return "{" + withcomma + "}"
      // return "{" + withcomma + "}"
    }
    // console.log("jsonmodified:\n", jsonModify(data))

    // modified_data = jsonModify(data)
    // const json_config = JSON.parse(modified_data)
    const json_config = parseConfig(data);
    console.log('PARSE DONE: ', json_config)
    var a = json_config.connection.h2h.local;
    console.log("local info:",a)
  })
});

// //文件读写（测试）
// ipcMain.on('read-file-msg', function(event, arg) {
//   // arg是从渲染进程返回来的数据
//   console.log(arg);
//   fs.readFile(path.join(__dirname,"./test.txt"),"utf8",(err,data)=>{
//   if(err){
// 		event.sender.send('read-file-reply', "Failure occurs when reading file");
// 	}else{
// 		event.sender.send('read-file-reply', data);
// 	}

//   })
// });

//启动StrongSwan
ipcMain.on('startStrongSwan', async (event, startTime) => {
  console.log('starttime=', startTime);
  if (startTime - new Date() < 0){
    console.log("输入时间早于当前时间！")
  }
  // 到规定时间后启动strongSwan
  execCommend('sudo ipsec start');
  execCommend('sudo swanctl --load-all');
  setTimeout(() => {
    execCommend('sudo ipsec up h2h');
    }, startTime - new Date())
})

