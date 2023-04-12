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
const cmdPath = 'C:/';

//该函数用于执行命令
function execCommend(commend){
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

// ipcMain.on('init_msg', async (e, msg) => {
//   console.log('main: ' + msg);
//   runExec.then(({ err, res }) => {
//     e.sender.send('msg-reply', res);
//   }).catch((err) => {
//     console.error(err);
//   });
// });

ipcMain.on('save_config', async (e, msg) => {
  console.log('main: ' + msg.localID);
  var runExec = execCommend('echo baidu.com')
  runExec.then(({ err, res }) => {
    e.sender.send('msg-reply', res);
  }).catch((err) => {
    console.error(err);
  });

});

//文件读写
ipcMain.on('read-file-msg', function(event, arg) {
  // arg是从渲染进程返回来的数据
  console.log(arg);
  // 这里是传给渲染进程的数据
  fs.readFile(path.join(__dirname,"./test.txt"),"utf8",(err,data)=>{
  	if(err){
		event.sender.send('read-file-reply', "Failure occurs when reading file");
	}else{
		event.sender.send('read-file-reply', data);
	}
  })
});

//启动StrongSwan
ipcMain.on('startStrongSwan', async (event, startTime) => {
  if (startTime - new Date() < 0){
    console.log("输入时间早于当前时间！")
  }
  setTimeout(() => {
    // 到规定时间后启动strongSwan

  }, startTime - new Date())
})