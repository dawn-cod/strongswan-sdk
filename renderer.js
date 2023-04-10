/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

const ipcRenderer = require('electron').ipcRenderer;

var time;
ipcRenderer.on('msg-reply', (e, msg) => {
    document.getElementById('msg').innerText = msg;
    clearTimeout(time);
    time = setTimeout(() => {
        document.getElementById('msg').innerText = '密服平台PC终端SDK';
    }, 3000);
});

function init() {
    ipcRenderer.send('init', 'init');
}

// 渲染进程
// const ipcRenderer = require("electron").ipcRenderer;

// 这里是接收主进程传递过来的参数，这里的on要对应主进程send过来的名字
ipcRenderer.on("asynchronous-reply", function(event, arg) {
// 这里的arg是从主线程请求的数据
  	console.log("render+" + arg);
});

// 这里的会传递回给主进程，这里的第一个参数需要对应着主进程里on注册事件的名字一致
ipcRenderer.send("asynchronous-message", "传递回去ping");

