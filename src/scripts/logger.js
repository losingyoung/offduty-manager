const moment = require('moment')
const {getLogPath, getAppDataDir} = require('./data')
const fs = require('fs')
// const fs = require('graceful-fs')
const util = require('util')
const path = require('path')
const readFile = util.promisify(fs.readFile)
let times = 0
class Logger {
    // async readLog() {
    //     let curLog = ''
    //     try {
    //         curLog = await readFile(getLogPath(), {encoding: 'utf-8'})
    //     } catch (error) {
    //         console.log('no log')
    //         // await writeFile(getLogPath())
    //     }
    //     return curLog
    // }
    static addLog(txt) {
        let time = moment().format("YYYY-MM-DD hh:mm:ss")
        txt = `${time} ${txt}\n`
        console.log('write', txt)
        try {
            fs.appendFileSync(getLogPath(), txt)
            // fs.appendFileSync('./file.txt', txt)
            console.log('write log success', times++)
        } catch (error) {
            console.log('wrtite log error', error.message)
        }
    }
}
function delOldLog() {
    let dataDir = getAppDataDir()
    fs.readdir(dataDir, (err, files) => {
        if (err) return
        const reg = /log_(\d{4})_(\d{2})_(\d{2})\.txt/
        files.forEach(file => {
            const result = file.match(reg)
            if (!result) return
            const logDate = moment(`${result[1]}-${result[2]}-${result[3]}`, 'YYYY-MM-DD')
            const oneWeekBefore = moment().subtract(7, 'days')
            if (logDate.isSameOrBefore(oneWeekBefore)) {
                fs.unlink(path.resolve(dataDir, file), err => {})
            }
        })
    })
}
exports.Logger = Logger
exports.delOldLog = delOldLog