/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const ipcRenderer = require('electron').ipcRenderer;

//下一段仅用于测试回显
var time;
ipcRenderer.on('msg-reply', (e, msg) => {
    document.getElementById('msg').innerText = msg;
    clearTimeout(time);
    time = setTimeout(() => {
        document.getElementById('msg').innerText = '密服平台PC终端SDK';
    }, 3000);
});

function saveConfig() {
    //抓取用户输入
    var InitConfig = {};
    InitConfig.LocalID = document.getElementById("LocalID").value;
    InitConfig.RemoteID = document.getElementById("RemoteID").value;
    InitConfig.LocalIP = document.getElementById("LocalIP").value;
    InitConfig.RemoteIP = document.getElementById("RemoteIP").value;
    InitConfig.reconnectGapSecond = document.getElementById("reconnectGapSecond").value;
    //用户输入判断（未完成）
    //...
    //...
    ipcRenderer.send('save_config', InitConfig);
}

// 这里是接收主进程传递过来的参数，这里的on要对应主进程send过来的名字
ipcRenderer.on("read-file-reply", function(event, arg) { // 这里的arg是从主线程请求的数据
          console.log("read-file-reply\n" + arg);
    });
ipcRenderer.on("write-file-reply", function(event, arg) {
          console.log("write-file-reply\n" + arg);
    });

// function fileRead() {
//     // 这里的会传递回给主进程，这里的第一个参数需要对应着主进程里on注册事件的名字一致
//     ipcRenderer.send("read-file-msg", "传递回去ping");
// }

function startStrongSwan(){
    let startTime = new Date();
    timeString = document.getElementById("startTime").value;
    const startTimeStr = timeString.split(":") ;
    startTime.setHours(startTimeStr[0]);
    startTime.setMinutes(startTimeStr[1]);
    startTime.setSeconds(startTimeStr[2]);
    ipcRenderer.send("startStrongSwan", startTime);
}