const moment = require('moment')
const {getLogPath, getAppDataDir} = require('./data')
const fs = require('fs')
const util = require('util')
const path = require('path')
const readFile = util.promisify(fs.readFile)
class Logger {
    async readLog() {
        let curLog = ''
        try {
            curLog = await readFile(getLogPath(), {encoding: 'utf-8'})
        } catch (error) {
            console.log('no log')
            // await writeFile(getLogPath())
        }
        return curLog
    }
    writeLog(txt) {
        console.log('write', txt)
        try {
            fs.appendFileSync(getLogPath(), txt)
        } catch (error) {
            console.log('wrtite log error', error.message)
        }
    }
    async addLog(txt) {
        await this.writeLog(`${this.getTime()} ${txt}\n`)
    }
    getTime(){
        return moment().format("YYYY-MM-DD hh:mm:ss")
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