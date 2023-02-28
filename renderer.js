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
