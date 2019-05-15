const {inRange} = require('./utils')
const {getAppDataDir} = require('./data')
const fse = require('fs-extra')
const {TimeData} = require('./excel')
const {byId} = require('./dom')
const {resetCalculation} = require('./calculation')
const _alert = require('../components/alert')
const moment = require('moment')
const {setTimeTable} = require('./showTable')

const addListeners = () => {
    addSaveBtnListener()
    addInputHourChangeListener()
    addInputMinuteChangeListener()
}

const addSaveBtnListener = () => {
    const ele = byId('saveBtn')
    ele.addEventListener('click', clickSaveBtn)
}   
const addInputHourChangeListener = () => {
    const ele = byId('timeHour')
    ele.addEventListener('input', changeHour)
}

const addInputMinuteChangeListener = () => {
    const ele = byId('timeMinute')
    ele.addEventListener('input', changeMinute)
}

const clickSaveBtn = event => {
    const time = getTime()
    if (!time) return
    saveTime(time)
}
const changeHour = function(){
    if (this.value.length === 2) {
        byId('timeMinute').focus()
    }
}
const changeMinute = function(){
    if (this.value.length === 2) {
        byId('saveBtn').focus()
    }
}
const setInputTime = function() {
  const hour = moment().hour() + ''
  const minute = moment().minute() + ''
  byId('timeHour').value = hour.padStart('2', '0')
  byId('timeMinute').value = minute.padStart('2', '0')
}
const saveTime = async time => {
    const data = `${time.hour}:${time.minute}`
    try {
        await TimeData.addData(data)
        _alert('保存成功')
        resetCalculation()
        setTimeTable()
    } catch (error) {
        _alert('保存失败: ' + error.message)
    }
    
}

const getTime = () => {
    const hour = byId('timeHour').value
    const minute = byId('timeMinute').value
    if (!inRange(hour, {min: 0, max: 24})) {
        _alert('小时需在0-24之间')
        return
    }
    if (!inRange(minute, {min: 0, max: 59})) {
        _alert('分钟需在0-59之间')
        return
    }
    if (hour === 24) hour = 0
    return {
        hour,
        minute
    }
}

addListeners()
setInputTime()
setInterval(setInputTime, 1000 * 60 * 5)