const { getRecodingDataPath } = require('./data')
const fse = require('fs-extra')
const moment = require('moment')
const { TimeData } = require('./excel')
const { logger } = require('./logger')
const electron = require('electron')

const dataPath = getRecodingDataPath()

function getToday() {
    return moment().format('YYYY.MM.DD')
}
function isWeekend() {
    const weekend = [0, 6]
    return weekend.indexOf(moment().weekday()) > -1
}

async function checkPreviousSaved() {
    savePreviousData()
    // setInterval(checkPreviousSaved, 1000 * 10)
    setInterval(checkPreviousSaved, 1000 * 60 * 60 * 6)
}
// 一小时检查一次xlsx当天是否已记录, 是则关闭timer
function checkIfTodaySaved() {

}
class Recorder {
    constructor() {
        this._record = false
        this.timer = null
        this.inIdle = false
        this.idleTime = 1000 * 60 * 6
    }
    startRecording() {
        logger.addLog('start recording')
        this._record = true
        if (!this.timer) {
            // this.timer = setInterval(() => {this.record()}, 1000 * 5)
            this.timer = setInterval(() => {this.record()}, 1000 * 60 * 5)
        }
    }
    async record() {
        logger.addLog(`recording is ${this._record}`)
        this.queryIdle()
        if (this._record && !this.inIdle) {
            if (!isWeekend()) {
                let data = await readData()
                data[getToday()] = moment().format('HH:mm')
                await saveData(data)
            }
        }
    }
    queryIdle() {
        electron.powerMonitor.querySystemIdleTime(time => {
            if (time > this.idleTime) {
                this.inIdle = true
            } else {
                this.inIdle = false
            }
        })
    }
    stopRecording() {
        logger.addLog('stop recording')
        this._record = false
        if (this.timer) {
            this.timer = clearInterval(this.timer)
        }
    }
}
async function savePreviousData() {
    let data = await readData()
    Object.keys(data).forEach(async date => {
        if (date === getToday()) {
            return
        }
        let query = date.split(".")
        let queryObj = { year: query[0], month: query[1], date: query[2] }
        let existData = await TimeData.findDataByDate(queryObj)
        let thatDate = data[date]
        delete data[date]
        if (existData) {
            return
        }
        await TimeData.addData(thatDate, queryObj)
        saveData(data)
        return
    })
}
function readData() {
    return new Promise(resolve => {
        fse.readFile(dataPath, { encoding: 'utf-8' }, (err, data) => {
            if (err) {
                resolve({})
                return
            }
            try {
                data = data || '{}'
                data = JSON.parse(data)
            } catch (error) {
                console.log('parse recording data err', data)
                resolve({})
            }
            resolve(data)
        })
    })

}
function saveData(data) {
    fse.writeFile(dataPath, JSON.stringify(data), err => {
        // record err
    })
}
checkPreviousSaved()
let recorder = new Recorder()
recorder.startRecording()
module.exports = recorder
