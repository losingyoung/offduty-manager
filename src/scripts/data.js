const moment = require('moment')
const {dialog, app, remote} = require('electron')
const path = require('path')

const getAppDataDir = (name) => {
    const storeDir =(app || remote.app).getPath('userData')
    let filePath = path.join(storeDir, name)
    return filePath
}
exports.getAppDataDir = getAppDataDir
exports.getTimeXlsxPath = (name='time.xlsx') => {
    return getAppDataDir(name)
}

exports.getRecodingDataPath = (name='recording.json') => {
    return getAppDataDir(name)
}
exports.getUserSettingPath = (name='user.config') => {
    return getAppDataDir(name)
}

exports.getLogPath = () => {
    let file = `log_${moment().format('YYYY_MM_DD')}.txt`
    return getAppDataDir(file) 
}