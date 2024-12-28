const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openFileDialog: () => ipcRenderer.send('open-file-dialog-for-file'),
    sendFileUpload: (path) => ipcRenderer.send('send-file-upload', path),
    onFileSelected: (callback) => ipcRenderer.on('selected-file', callback),
    onFileDetails: (fileDetails) => ipcRenderer.on('file-details-get', fileDetails),
    onConfigGet: () => ipcRenderer.send('get-config'),
    OnConfigGetCallback: (config) => ipcRenderer.on("get-config-callback", config),
    OnSetWebhook: (url) => ipcRenderer.send("set-webhook", url),
    OnDeleteFile: (fileID) => ipcRenderer.send("delete-file", fileID),
    OnClearAllFiles: () => ipcRenderer.send("clear-all-files"),
    OnDownloadFile: (fileID, fileName) => ipcRenderer.send("download-file", fileID, fileName)
});
