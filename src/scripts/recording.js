const { getRecodingDataPath } = require('./data')
const fse = require('fs-extra')
const moment = require('moment')
const { TimeData } = require('./excel')
const {Logger} = require('./logger')
const electron = require('electron')
const {setTimeTable} = require('./showTable')
const {resetCalculation} = require('./calculation')

function getToday() {
    return moment().format('YYYY.MM.DD')
}
function isWeekend() {
    const weekend = [0, 6]
    return weekend.indexOf(moment().weekday()) > -1
}

async function checkPreviousSavedData() {
    savePreviousData()
    if (process.env.NODE_ENV === 'development') {
        setInterval(checkPreviousSavedData, 1000 * 10)
    } else {
        setInterval(checkPreviousSavedData, 1000 * 60 * 60 * 6)
    }
}
// 一小时检查一次xlsx当天是否已记录, 是则关闭timer
function checkIfTodaySaved() {

}
class Recorder {
    constructor() {
        this._record = false
        this.timer = null
        this.inIdle = false
        this.logger = new Logger()
        this.idleTime = process.env.NODE_ENV === 'development' ? 3 : 60 * 3
    }
    startRecording() {
        this.logger.addLog('start recording')
        this._record = true
        if (!this.timer) {
            if (process.env.NODE_ENV === 'development') {
                this.timer = setInterval(() => {this.record()}, 1000 * 20)
            } else {
                this.timer = setInterval(() => {this.record()}, 1000 * 60 * 5)
            }
            // this.timer = setInterval(() => {this.record()}, 1000 * 5)
            
        }
    }
    async record() {
        this.logger.addLog(`recording is ${this._record}, inidle is ${this.inIdle}`)
        this.queryIdle()
        if (this._record && !this.inIdle) {
            if (!isWeekend() || process.env.NODE_ENV === 'development') {
                console.log('update date')
                let data = await readData()
                data[getToday()] = moment().format('HH:mm')
                await saveData(data)
            }
        }
    }
    queryIdle() {
        electron.powerMonitor.querySystemIdleTime(time => {
            this.logger.addLog(`idle time: ${time}`)
            if (time > this.idleTime) {
                this.inIdle = true
            } else {
                this.inIdle = false
            }
        })
    }
    stopRecording() {
        this.logger.addLog('stop recording')
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
        setTimeTable()
        resetCalculation()
        return
    })
}
function readData() {
    return new Promise(resolve => {
        fse.readFile(getRecodingDataPath(), { encoding: 'utf-8' }, (err, data) => {
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
    fse.writeFile(getRecodingDataPath(), JSON.stringify(data), err => {
        // record err
        if (err) {
            this.logger.addLog(`error: ${err}`)
            return
        }
        
    })
}

module.exports = {
    Recorder,
    checkPreviousSavedData
}
