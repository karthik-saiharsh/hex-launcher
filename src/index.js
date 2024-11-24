const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('node:path');

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
    height: 600,
    backgroundMaterial: "acrylic",
    // transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });


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
});

app.on('window-all-closed', () => {
    app.quit();
});
