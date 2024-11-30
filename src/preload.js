const {ipcRenderer, contextBridge, app} = require('electron');

contextBridge.exposeInMainWorld("backend", {
    quit: () => ipcRenderer.send('quit'),
    webSearch: (query) => ipcRenderer.send('search', query),
    ytSearch: (query) => ipcRenderer.send('yt-search', query),
    checkInstalled: (appName) => ipcRenderer.invoke('check-installed', appName),
    launchApp: (appName) => ipcRenderer.send('launch-app', appName),
    openYt: (query) => ipcRenderer.send('open-yt', query),
    print: (text) => ipcRenderer.send('print', text),
    evaluvateFunc: (func) => ipcRenderer.invoke('math-eval', func),
    solveEquation: (equation, variable) => ipcRenderer.invoke('solve-equation', equation, variable),
    getDefinition: (word) => ipcRenderer.invoke('get-definition', word),
    setTimer: (seconds) => ipcRenderer.send('set-timer', seconds),
    setAudio: (volume) => ipcRenderer.invoke('set-audio', volume),
    setBrightness: (brightness) => ipcRenderer.invoke('set-brightness', brightness),
    convertCurrency: (amount, fromCurrency, toCurrency) => ipcRenderer.invoke("convert-currency", amount, fromCurrency, toCurrency),
    setAlarm: (hrs, mins) => ipcRenderer.send('set-alarm', hrs, mins),
});