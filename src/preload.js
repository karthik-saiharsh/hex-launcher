const {ipcRenderer, contextBridge, app} = require('electron');

contextBridge.exposeInMainWorld("backend", {
    quit: () => ipcRenderer.send('quit'),
    webSearch: (query) => ipcRenderer.send('search', query),
    ytSearch: (query) => ipcRenderer.send('yt-search', query),
    checkInstalled: (appName) => ipcRenderer.invoke('check-installed', appName),
    launchApp: (appName) => ipcRenderer.send('launch-app', appName)
});