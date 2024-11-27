const { app, BrowserWindow, Menu, globalShortcut, screen, ipcMain, shell } = require('electron');
const path = require('node:path');
const isInstalled = require('is-program-installed');
const {exec} = require('child_process');
const { evaluate} = require('mathjs');




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
ipcMain.handle('solve-equation', (event, equation, variable) => {
  try {
      // Define the function to find roots
      const evaluateEquation = (x) => {
          const expr = equation.replace(new RegExp(variable, 'g'), `(${x})`);
          return evaluate(expr);
      };

      // Simple numerical method: Test values between -100 and 100
      const solutions = [];
      for (let x = -100; x <= 100; x += 0.1) {
          const result = evaluateEquation(x);
          if (Math.abs(result) < 1e-5) { // Close enough to zero
              solutions.push(Number(x.toFixed(2))); // Add rounded solution
          }
      }

      // Remove duplicates and return unique solutions
      const uniqueSolutions = [...new Set(solutions)];
      if (uniqueSolutions.length === 0) {
          return "No solution found for the given equation.";
      }
      return `Solution: ${uniqueSolutions.join(', ')}`;
  } catch (error) {
      console.error("Error solving equation:", error.message);
      return "The equation cannot be solved.";
  }
});

ipcMain.handle('dictionary', async (event, word) => {
  try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!response.ok) {
          throw new Error("Word not found");
      }
      const data = await response.json();
      return data[0].meanings[0].definitions[0].definition;
  } catch (error) {
      return "Meaning or definition not found.";
  }
});
ipcMain.on('set-timer', (event, seconds) => {
  let remainingTime = seconds;

  const interval = setInterval(() => {
      if (remainingTime > 0) {
          // Send the remaining time to the renderer process
          event.reply('timer-update', remainingTime);
          remainingTime--;
      } else {
          clearInterval(interval);
          // Notify when the timer is up
          event.reply('timer-done');
      }
  }, 1000);
});