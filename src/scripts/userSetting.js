const {getUserSettingPath} = require('./data')
const fse = require('fs-extra')

const filePath = getUserSettingPath()
function getUserSetting() {
    let setting = {}
    try {
        let str = fse.readFileSync(filePath, {encoding: 'utf-8'})
        setting = JSON.parse(str)
    } catch (error) {
        
    }
    return setting
}
function setUserSetting(key, value) {
    var curSetting = getUserSetting()
    curSetting[key] = value
    saveUserSetting(curSetting)
}

function saveUserSetting(data) {
    fse.writeFileSync(filePath, JSON.stringify(data))
}

module.exports = {
    getUserSetting,
    setUserSetting,
    saveUserSetting
}