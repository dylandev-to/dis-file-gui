const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require("fs")
const os = require('os');

const { DisFile } = require("node-dis-file");
const { getConfig, setNewWebhook, addNewFile, clearAllFiles, deleteFile } = require('./config');

var disFile = new DisFile(getConfig().webhook_url);

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    icon: path.join(__dirname, "public", "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Settings
  mainWindow.setMenuBarVisibility(false)

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Events

ipcMain.on('open-file-dialog-for-file', (event) => {
  const options = {
    properties: ['openFile'],
  };

  if (os.platform() === 'linux' || os.platform() === 'win32') {
    dialog.showOpenDialog(options).then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        console.log(result.filePaths[0])
        event.sender.send('selected-file', result.filePaths[0]);
      }
    });
  } else {
    dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory'],
    }).then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        console.log(result.filePaths[0])
        event.sender.send('selected-file', result.filePaths[0]);
      }
    });
  }
});

ipcMain.on("send-file-upload", async (event, filePath) => {
  const fileName = path.basename(filePath);
  const fileDetails = await disFile.uploadFile(filePath, fileName)
  addNewFile({
    fileName: fileDetails.fileName,
    primaryID: fileDetails.primaryID
  })
  event.sender.send("file-details-get", fileDetails)
})

ipcMain.on('get-config', (event) => {
  event.sender.send("get-config-callback", getConfig())
})

ipcMain.on("set-webhook", (event, url) => {
  setNewWebhook(url);
  disFile = new DisFile(getConfig().webhook_url);
})

ipcMain.on("clear-all-files", (event) => {
  clearAllFiles();
  event.sender.send("get-config-callback", getConfig())
})

ipcMain.on("delete-file", (event, fileID) => {
  deleteFile(fileID)
  event.sender.send("get-config-callback", getConfig())
})

ipcMain.on("download-file", (event, fileID, fileName) => {
  dialog.showSaveDialog({
    title: 'Save your file',
    defaultPath: fileName,
  }).then(async result => {
    if (!result.canceled && result.filePath) {
      const fileBuffer = await disFile.downloadFileBuffer(fileID);
      fs.writeFile(result.filePath, fileBuffer, (err) => {
        if (!err) {
        }
      });
    }
  })
})