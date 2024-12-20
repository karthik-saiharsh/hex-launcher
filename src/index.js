const { app, BrowserWindow, Menu, globalShortcut, ipcMain, shell, Notification, dialog } = require('electron');
const path = require('node:path');
const isInstalled = require('is-program-installed');
const { exec } = require('child_process');
const { evaluate } = require('mathjs');
const loudness = require('loudness');
const fetch = require("node-fetch");


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
  mainWindow.on('blur', () => { mainWindow.hide() });

  // Register the global shortcut to launch hex-launcher
  const key_pressed = globalShortcut.register("Control+Space", () => {
    // If the key is pressed, then show the app. Pressing the key again should hide it
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
  });

  // If registering global shortcut fails, quit the app
  if (!key_pressed) {
    console.log("There was an error registering Global Shortcut!!");
    app.quit();
  }

  // Pressing ctrl+shift+Q will quit the app
  globalShortcut.register("Control+Shift+Q", () => { app.quit() });

  console.log("All Ready!");
});

app.on('window-all-closed', () => {
  app.quit();
});

//// HELPER FUNCTIONS ////
function setAlarm(hours, minutes) {
  let now = new Date()
  if (now.getHours() == hours && now.getMinutes() == minutes) {
    new Notification({ title: "Alarm Remainder", body: `Your alarm for ${hours}:${minutes} is due`, timeoutType: 'never' }).show();
    return;
  } else {
    setTimeout(() => { setAlarm(hours, minutes) }, 1000);
  }
}
//// HELPER FUNCTIONS ////

// Connecting Actions from IPCRenderer
ipcMain.on('search', (event, query) => { shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(query)}`); });
ipcMain.on('quit', () => { app.quit() });
ipcMain.on('yt-search', (event, query) => { shell.openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`); });
ipcMain.handle('check-installed', (event, name) => { return isInstalled(name) });
ipcMain.on('launch-app', (event, appName) => { exec(appName) });
ipcMain.on('open-yt', (event, query) => { shell.openExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`) });
ipcMain.on('print', (event, val) => { console.log(val) });
ipcMain.handle('math-eval', (event, func) => { return evaluate(func) });
ipcMain.on('set-timer', (event, time) => { setTimeout(() => { new Notification({ title: "Time up!", body: "You set a timer, and the time's up!", timeoutType: "never" }).show() }, time * 1000) });
ipcMain.on('set-alarm', (event, hours, minutes) => { setAlarm(hours, minutes) });
ipcMain.on('execute-command', (event, command) => {
  if(process.platform == 'linux') {
    exec(command[0]);
  } else if(process.platform == 'win32') {
    exec(command[1]);
  } else {
    console.log("Unknown OS");
  }
});

ipcMain.handle('solve-equation', (event, equation, variable) => {
  try {
    const evaluateEquation = (x) => {
      const expr = equation.replace(new RegExp(variable, 'g'), `(${x})`);
      return evaluate(expr);
    };
    const solutions = [];
    for (let x = -100; x <= 100; x += 0.1) {
      const result = evaluateEquation(x);
      if (Math.abs(result) < 1e-5) {
        solutions.push(Number(x.toFixed(2)));
      }
    }
    const uniqueSolutions = [...new Set(solutions)];
    if (uniqueSolutions.length === 0) {
      return "No solution found for the given equation.";
    }
    return `Solution: ${uniqueSolutions.join(', ')}`;
  } catch (error) {
    return "The equation cannot be solved.";
  }
});

ipcMain.handle('get-definition', async (event, word) => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) {
      throw new Error('Word not found');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return 'Meaning or definition not found.';
  }
});


ipcMain.handle('set-audio', async (event, volume) => {
  try {
    await loudness.setVolume(volume);
    return `Audio volume set to ${volume}%`;
  } catch (error) {
    return "Failed to set audio volume.";
  }
});

ipcMain.handle('set-brightness', (event, brightness) => {
  try {
    // Windows-specific brightness control using PowerShell
    const command = `powershell.exe (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,${brightness})`;
    exec(command, (error) => {
      if (error) {
        return `Failed to set brightness: ${error.message}`;
      }
    });
    return `Brightness set to ${brightness}%`;
  } catch (error) {
    return "Failed to set brightness.";
  }
});

ipcMain.handle("convert-currency", async (event, amount, fromCurrency, toCurrency) => {
  try {
    const apiKey = ""; //API Key
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching exchange rates: ${response.statusText}`);
    }

    const data = await response.json();
    const rate = data.conversion_rates[toCurrency];

    if (!rate) {
      throw new Error(`Conversion rate for ${toCurrency} not found.`);
    }

    const convertedAmount = (amount * rate).toFixed(2);
    return `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
  } catch (error) {
    return "Failed to fetch currency conversion.";
  }
});