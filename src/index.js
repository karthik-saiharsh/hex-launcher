const { app, BrowserWindow, Menu, globalShortcut, screen, ipcMain, shell } = require('electron');
const path = require('node:path');
const isInstalled = require('is-program-installed');
const {exec} = require('child_process');
const {evaluate} = require('mathjs');

///////// Global Variables /////////
let mainWindow;
///////// Global Variables /////////

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 480,
    transparent: true,
    titleBarStyle: 'hidden',
    title: "Hex-Launcher",
    center: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
      sandbox: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Disable Menu Bar for the application
  Menu.setApplicationMenu(null);

  // mainWindow.webContents.openDevTools();
};


app.whenReady().then(() => {
  createWindow();

  // mainWindow.hide(); // Keep the window Hidden during first launch

  // If the Window loses focus, then hide it automatically
  mainWindow.on('blur', () => {mainWindow.hide()});

  // Register the global shortcut to launch hex-launcher
  const key_pressed = globalShortcut.register("Control+Space", () => {
    // If the key is pressed, then show the app. Pressing the key again should hide it
    if(mainWindow.isVisible()) {
      mainWindow.hide();
    } else if(!mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  // If registering global shortcut fails, quit the app
  if(!key_pressed) {
    console.log("There was an error registering Global Shortcut!!");
    app.quit();
  }

  // Pressing ctrl+shift+Q will quit the app
  globalShortcut.register("Control+Shift+Q", () => {app.quit()});

  console.log("All Ready!");
});

app.on('window-all-closed', () => {
    app.quit();
});

// Connecting Actions from IPCRenderer
ipcMain.on('search', (event, query) => {shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(query)}`);});
ipcMain.on('quit', () => {app.quit()});
ipcMain.on('yt-search', (event, query) => {shell.openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);});
ipcMain.handle('check-installed', (event, name) => {return isInstalled(name)});
ipcMain.on('launch-app', (event, appName) => {exec(appName)});
ipcMain.on('open-yt', (event, query) => {shell.openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`)});
ipcMain.on('print', (event, val) => {console.log(val)});
ipcMain.handle('math-eval', (event, func) => {return evaluate(func)});