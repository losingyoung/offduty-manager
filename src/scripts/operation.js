const {byId, bindListener} = require('./dom')
const { getTimeXlsxPath } = require('./data')
const {TimeExcelValidation, TimeData} = require('./excel')
const fse = require('fs-extra')
const {dialog} = require('electron').remote
const moment = require('moment')
const _alert = require('../components/alert')
const {setTimeTable} = require('./showTable')
const {resetCalculation} = require('./calculation')
function addListeners() {
    addExportBtnListener()
    addImportBtnListener()
    addInitBtnListener()
}

function addExportBtnListener() {
    bindListener(byId('exportTime'), 'click', handleExportTime)
}
function addImportBtnListener() {
    bindListener(byId('importTime'), 'click', handleImportTime)
}
function addInitBtnListener() {
    bindListener(byId('initBtn'), 'click', handleInit)
}

function handleExportTime() {
    const year = moment().year()
    const month = moment().month() + 1
    const date = moment().date()
    dialog.showSaveDialog(null, {defaultPath:`time_${year}_${month}_${date}.xlsx`}, (filename) => {
        filename && fse.copyFile(getTimeXlsxPath(), filename, err => {
            if (err) {
                _alert(err.message)
                return
            }
            _alert('导出成功')
        })
    })
}
function handleImportTime() {
  dialog.showOpenDialog(null, {properties: ['openFile'], filters: [{name: 'Excels', extensions: ['xlsx']}]}, (filePaths) => {
      let filePath = filePaths && filePaths[0]
      const validator = new TimeExcelValidation(filePath)
      validator.validate().then(({result, msg}) => {
          if (result) {
              fse.copy(filePath, getTimeXlsxPath(), err => {
                if (err) {
                    _alert(err.message)
                    return
                }
                _alert('导入成功')
                setTimeTable()
                resetCalculation()
              })
              return
          }
          _alert(msg)
      })
  })
}
function handleInit() {
    TimeData.emptyData()
    setTimeTable()
    resetCalculation()
}
addListeners()