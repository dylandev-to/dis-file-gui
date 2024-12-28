const fs = require("fs")
const path = require('path')

const configFilePath = path.join(process.cwd(), "config.json")

var config;

function loadConfig() {
    if (!fs.existsSync(configFilePath)) {
        fs.writeFileSync(configFilePath, JSON.stringify(
            {
                webhook_url: "",
                files: []
            }, null, 2
        ))
    }
    config = JSON.parse(fs.readFileSync(configFilePath));
}

function getConfig() {
    if (!config) loadConfig();
    return config;
}

function setNewWebhook(url) {
    config.webhook_url = url;
    save()
}

function addNewFile(details) {
    config.files.push(details)
    save()
}

function deleteFile(fileID) {
    config.files = config.files.filter(x => x.primaryID !== fileID)
    save()
}

function clearAllFiles() {
    config.files = []
    save()
}

function save() {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2))
}

module.exports = {
    getConfig,
    addNewFile,
    setNewWebhook,
    deleteFile,
    clearAllFiles
}