const moment = require('moment')
const {getLogPath} = require('./data')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const appendFile = util.promisify(fs.appendFile)
// debugger
class Logger {
    constructor() {
        this.log = fs.createWriteStream(getLogPath(), {
            flags: 'a' // Open file for appending. The file is created if it does not exist.
        })
        this.count = 0
    }
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
        this.log.write(txt)
        
        // fs.appendFileSync(getLogPath(), txt)
        return
        try {
            // await appendFile(getLogPath(), txt)
        } catch (error) {
            console.log('wrtite log error')
        }
    }
    async addLog(txt) {
        await this.writeLog(`${this.getTime()} ${txt}\n`)
    }
    getTime(){
        return moment().format("YYYY-MM-DD hh:mm:ss")
    }
}
const logger = new Logger()
exports.logger = logger