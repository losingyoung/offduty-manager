const { getTimeXlsxPath } = require('./data')
const fse = require('fs-extra')
const { zip, inRange, isDate, getDate, getMonth, getYear } = require('./utils')
const Excel = require('exceljs')
const moment = require('moment')

class ExcelBase {
    constructor() {
        this.workbook = new Excel.Workbook();
    }
    async readWorkSheet(filename, sheet) {
        const workbook = this.workbook
        await workbook.xlsx.readFile(filename)
        return workbook.getWorksheet(sheet)

    }
    addRow(data) {
        this.checkWorksheet()
        this.worksheet.addRow(data)
    }

    useWorksheet(worksheet) {
        this.worksheet = worksheet
    }
    checkWorksheet() {
        if (!this.worksheet) {
            throw new Error('first call useWorksheet to target worksheet')
        }
    }
    createNewWorksheet(name, option) {
        const workbook = this.workbook
        // TODO: metadata
        // workbook.creator = 'me'
        // workbook.lastModifiedBy = 'me'
        workbook.created = workbook.modified = new Date()
        return workbook.addWorksheet(name, option)
    }
    saveXlsx(fileName) {
        return this.workbook.xlsx.writeFile(fileName)
    }
}

class TimeExcel extends ExcelBase {
    createNewTimeWorkSheet() {
        const sheetName = '时间'
        const option = {
            views: [{
                state: 'frozen',
                ySplit: 1
            }]
        }
        const newSheet = this.createNewWorksheet(sheetName, option)
        newSheet.addRow(['年', '月', '日', '时间'])
        return newSheet
    }
    checkExistDate({ year, month, date }) {
        this.checkWorksheet()
        let isExist = []
        this.worksheet.eachRow(function (row, rowNumber) {
            const [idx, _year, _month, _date, ...rest] = row.values
            if (_year === year && _month === month && _date === date) {
                isExist.push(rowNumber)
            }
        });
        return isExist
    }
    deleteRows(rows) {
        this.checkWorksheet()
        let deleted = 0
        rows.forEach(row => {
            this.worksheet.spliceRows(row - deleted, 1)
            deleted++
        })
    }
    async readWorkSheet(filePath) {
        let worksheet
        try {
            fse.accessSync(filePath)
            worksheet = await super.readWorkSheet(filePath, 1)
        } catch (error) {
            fse.createFileSync(filePath)
            worksheet = this.createNewTimeWorkSheet()
        }
        return worksheet
    }
}
class TimeExcelValidation extends ExcelBase {
    constructor(filePath) {
        super()
        this.filePath = filePath

    }
    async validate() {
        try {
            this.worksheet = await this.readWorkSheet(this.filePath, 1)
            let headerValidation = this.validateHeader()
            if (!headerValidation.result) {
                return headerValidation
            }
            let dataValidation = this.validateData()
            if (!dataValidation.result) {
                return dataValidation
            }
            return { result: true }
        } catch (error) {
            return {
                result: false,
                msg: error.message
            }
        }

    }
    validateHeader() {
        const header = ['年', '月', '日', '时间']
        try {
            let values = this.worksheet.getRow(1).values.slice(1)
            const correctHeader = zip(header, values, (head, value) => {

                if (head !== value) {
                    return false
                }
                return true
            })
            if (!correctHeader) {
                return {
                    result: false,
                    msg: `第一行表头应为:${header.join(',')}`
                }
            }
        } catch (error) {
            return {
                result: false,
                msg: error.message
            }
        }
        return {
            result: true
        }

    }
    validateData() {
        let invalidRow = []
        this.worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                return
            }
            const values = row.values
            if (!inRange(values[1], { min: 2018 })) {
                invalidRow.push(rowNumber)
                return
            }
            if (!inRange(values[2], { min: 1, max: 12 })) {
                invalidRow.push(rowNumber)
                return
            }
            // TODO: 根据月份检测
            if (!inRange(values[3], { min: 1, max: 31 })) {
                invalidRow.push(rowNumber)
                return
            }
            const time = values[4]
            if (!time) {
                invalidRow.push(rowNumber)
                return
            }
            console.log(time)
            if (isDate(time)) {
                invalidRow.push(rowNumber)
                return
            }
            const timePair = time.split(":")
            if (!timePair || timePair.length !== 2) {
                invalidRow.push(rowNumber)
                return
            }
            if (!inRange(timePair[0], { min: 0, max: 24 }) || !inRange(timePair[1], { min: 0, max: 59 })) {
                invalidRow.push(rowNumber)
                return
            }
        })
        if (invalidRow.length > 0) {
            return {
                result: false,
                msg: `请检查第${invalidRow.join(',')}, 输入正确的日期和时间, 时间格式为hh:mm, 单元格格式为文本非常规或时间`
            }
        }
        return { result: true }
    }
}

async function addData(offtime, customData = {}) {
    let excelHandler = new TimeExcel()
    let year = customData.year || getYear()
    let month = customData.month || getMonth()
    let date = customData.date || getDate()
    let worksheet = await excelHandler.readWorkSheet(getTimeXlsxPath())
    excelHandler.useWorksheet(worksheet)
    let isExist = excelHandler.checkExistDate({ year, month, date })
    if (isExist.length === 1) {
        let row = worksheet.getRow(isExist[0])
        let newValues = row.values
        newValues[4] = offtime
        row.values = newValues
    } else if (isExist.length > 1) {
        // 删掉之前的  bug 如果只有一条 重复的话会删不掉
        excelHandler.deleteRows(isExist)
        excelHandler.addRow([year, month, date, offtime])
    } else {
        excelHandler.addRow([year, month, date, offtime])
    }

    await excelHandler.saveXlsx(getTimeXlsxPath())
}
async function getDataWorkSheet() {
    let excelHandler = new TimeExcel()
    let worksheet = await excelHandler.readWorkSheet(getTimeXlsxPath())
    return worksheet
}
async function findDataByDate({ year, month, date }) {
    let excelHandler = new TimeExcel()
    let worksheet = await excelHandler.readWorkSheet(getTimeXlsxPath())
    excelHandler.useWorksheet(worksheet)
    let isExist = excelHandler.checkExistDate({ year, month, date })
    if (isExist.length >= 1) {
        let row = worksheet.getRow(isExist[0])
        return row.values[4]
    }
    return null
}
function emptyData() {
    fse.removeSync(getTimeXlsxPath())
}
const TimeData = {
    addData,
    findDataByDate,
    getDataWorkSheet,
    emptyData
}
module.exports = { TimeData, TimeExcelValidation }