// Modules to control application life and create native browser window
const electron = require('electron')
var path = require('path')
const {TimeData} = require('./src/scripts/excel')
const moment = require('moment')
const fse = require('fs-extra')
const {setAutoLaunch} = require('./src/scripts/autoLaunch')
const {getUserSetting} = require('./src/scripts/userSetting')
const {app, BrowserWindow, Tray, Menu, dialog} = electron
const recorder = require('./src/scripts/recording')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let tray = null
function createWindow () {
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800, height: 600,
    icon: path.join(__dirname, './assets/icons/png/64x64.png')
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.on('minimize', evt => {
    hideWindow()
  })
  hideWindow()
  // mainWindow.on('close', function () {
  //   stopRecording()
  // })
  // mainWindow.on('session-end', evt => {
  //   stopRecording()
  // })
}
function hideWindow() {
  mainWindow.hide()
  mainWindow.setSkipTaskbar(true)
}
function setContextMenu() {
  let icon = process.platform === 'win32' ? path.join(__dirname, './assets/icons/win/clock.png.ico') : path.join(__dirname, './assets/icons/png/16x16.png')
  tray = new Tray(icon)
  const userSettings = getUserSetting()
  let autoLaunch = !!userSettings.autoLaunch
  const contextMenu = Menu.buildFromTemplate([
    {label: '显示界面', type: 'normal', click: function(menu, browserWindow, event) {
      if (mainWindow === null) {
        createWindow()
      } else {
        mainWindow.show()
      }
    }},
    {label: '下班', type: 'normal', click: function(menu, browserWindow, event) {
      let now = `${moment().hour()}:${moment().minute()}`
      TimeData.addData(now)
    }},
    {
      label: '开机自启动',
      type: 'checkbox',
      checked: autoLaunch,
      click: function(menu, browserWindow, event) {
        let ifAutoLaunch = !autoLaunch
        setAutoLaunch(ifAutoLaunch)
      }
    },
    {label: '退出', type: 'normal', click: function(menu, browserWindow, event) {
      quit()
    }}
  ])
  tray.setToolTip('右键打开菜单')
  tray.setContextMenu(contextMenu)
}
function quit() {
  if (mainWindow) mainWindow.destroy()
  app.quit()
}
function listenPowerChanged() {
  electron.powerMonitor.on('resume', () => {
    recorder.startRecording()
  })
  electron.powerMonitor.on('suspend', () => {
    recorder.stopRecording()
  })
  electron.powerMonitor.on('unlock-screen', () => {
    recorder.startRecording()
  })
  electron.powerMonitor.on('lock-screen', () => {
    recorder.stopRecording()
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  setContextMenu()
  listenPowerChanged()
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
// function recordCloseTime() {
//   let cur = ''
//   try {
//     cur = fse.readFileSync('log.txt', {encoding: 'utf-8'})
//   } catch (error) {
    
//   }
  
//   fse.writeFileSync('log.txt', `${cur} \n ${moment().toString()}: exit`)
// }
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// process.on('exit', () => {
//   recordCloseTime()
// })