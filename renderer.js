// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
require('./src/scripts/form')
require('./src/scripts/operation')
const { addCalculateBtnListener,  initRender} = require('./src/scripts/calculation')
const { checkAutoLaunch } = require('./src/scripts/autoLaunch')
const { setTimeTable } = require('./src/scripts/showTable')
const { delOldLog } = require('./src/scripts/logger')
checkAutoLaunch()
addCalculateBtnListener()
initRender()
setTimeTable()
delOldLog()
const {ipcRenderer} = require('electron')

ipcRenderer.on('update-table', (event, message) => {
    document.getElementById('displayTable').innerHTML = message
})
