const {byId, bindListener} = require('./dom')
const moment = require('moment')
const {TimeData} = require('./excel')
const {isRenderer} = require('./utils')
const {ipcRenderer} = require('electron')


function initRender() {
    ipcRenderer.on('update-calculation', (event, {weekAvrg, monthAvrg, thisQuaterAvrg, lastQuaterAvrg, yearAvrg}) => {
        byId('weekAvrg').innerText=weekAvrg
        byId('monthAvrg').innerText=monthAvrg
        byId('thisQuater').innerText=thisQuaterAvrg
        byId('lastQuater').innerText=lastQuaterAvrg
        byId('yearAvrg').innerText=yearAvrg
    })
}

function addCalculateBtnListener() {
    bindListener(byId('calculateBtn'), 'click', resetCalculateDate)
}
async function resetCalculateDate() {
    const include6Minute = isRenderer() ? byId('count6Input').checked : true
    let worksheet = await TimeData.getDataWorkSheet()
    const weekAvrg = calculateWeekAvrg(worksheet, {include6Minute})
    
    const monthAvrg = calculateMonthAvrg(worksheet, {include6Minute})
    
    const thisQuater = moment().quarter()
    const thisQuaterAvrg = calculateQuaterAvrg(worksheet, thisQuater, {include6Minute})
    
    const lastQuater = thisQuater - 1
    const lastQuaterAvrg = calculateQuaterAvrg(worksheet, lastQuater, {include6Minute})
   
    const yearAvrg = calculateYearAvrg(worksheet, {include6Minute})
    if (isRenderer()) {
        byId('weekAvrg').innerText=weekAvrg
        byId('monthAvrg').innerText=monthAvrg
        byId('thisQuater').innerText=thisQuaterAvrg
        byId('lastQuater').innerText=lastQuaterAvrg
        byId('yearAvrg').innerText=yearAvrg
    } else {
        const mainWindow = require('../../main')()
        webContents = mainWindow.webContents
        webContents.send('update-calculation', {weekAvrg, monthAvrg, thisQuaterAvrg, lastQuaterAvrg, yearAvrg})
    }
    
    
}
function calculateWeekAvrg(worksheet, option){
    const day = moment().weekday() || 7
    return findDataSubtractByDay(worksheet, day, option)
}
function calculateMonthAvrg(worksheet, option){
    const day = moment().date()
    return findDataSubtractByDay(worksheet, day, option)
}
function calculateQuaterAvrg(worksheet, quater, option) {
    const quaterStartEndMonth = [[], [1, 4], [4, 7], [7, 10], [10, 13]]
    const startEndMonth = quaterStartEndMonth[quater]
    const [startMonth, endMonth] = startEndMonth
    const day = moment().date()
    const startDate = moment("00:00:00", "hh:mm:ss").month(startMonth - 1).subtract(day - 1, 'days').subtract()
    const endDate = moment("00:00:00", "hh:mm:ss").month(endMonth - 1).subtract(day - 1, 'days')
    const formatTimes = findTimesInRange(worksheet, startDate, endDate)

    return calculateAvrg(formatTimes, option)
}
function calculateYearAvrg(worksheet, option){
    const startDate = moment().year()
    const formatTimes = findTimesInRange(worksheet, startDate)
    return calculateAvrg(formatTimes, option)
}
function findDataSubtractByDay(worksheet, day, option) {
    const startDate = moment().subtract(day, 'days')
    const formatTimes = findTimesInRange(worksheet, startDate)
    return calculateAvrg(formatTimes, option)
}
function findTimesInRange(worksheet, startDate, endDate=moment().add(1, 'days')) {
    const times = []
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return
        const values = row.values
        if (values.length < 4) {
            return
        }
        const date = moment(`${values[1]}-${values[2]}-${values[3]}`)
        if (date.isSameOrAfter(startDate) && date.isBefore(endDate)) {
            times.push(values[4])
        }
    })
    const formatTimes = times.map(time => {
        if (moment.isDate(time)) {
            time = moment.utc(time)
            return `${time.hour()}:${time.minute()}`
        }
        return time
    })
    return formatTimes
}
function findRowsInRange(worksheet, startDate, endDate=moment().add(1, 'days')) {
    const times = []
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return
        const values = row.values
        if (values.length < 4) {
            return
        }
        const date = moment(`${values[1]}-${values[2]}-${values[3]}`)
        if (date.isSameOrAfter(startDate) && date.isBefore(endDate)) {
            times.push(values)
        }
    })
    return times
}
function calculateAvrg(times, {include6Minute}) {
    const standardOffHour = 18
    let days = times.length
    let total = times.reduce((sum, time) => {
        const timePair = time.split(":")
        const hour = parseInt(timePair[0], 10)
        const minute = parseInt(timePair[1], 10)
        if (hour >= 9 && hour < 18) {
            return sum
        }
        if (hour < 9) {
            return sum + minute + (hour + 6) * 60
        }
        if (hour >= 19) {
            return sum + minute + (hour - standardOffHour) * 60
        }
        return include6Minute ? sum + minute : sum
    }, 0)
    const avrgMinute = total / days | 0
    const hour = (avrgMinute / 60) | 0
    const minute = avrgMinute % 60
    return `${18+hour > 24 ? hour - 6 : 18+hour}:${("0" + minute).slice(-2)}`
}


module.exports = {
    addCalculateBtnListener,
    resetCalculation: resetCalculateDate,
    findRowsInRange,
    initRender
}