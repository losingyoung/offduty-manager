const {byId} = require('./dom')
const {findRowsInRange} = require('./calculation')
const {TimeData} = require('./excel')
const moment = require('moment')


async function setTimeTable() {
    const data = await getTableData()
    const html = generateTable(data)
    if (typeof window === 'undefined' || !document) {
        const mainWindow = require('../../main')()
        webContents = mainWindow.webContents
        webContents.send('update-table', html)
        return 
    }
    let table = byId('displayTable')
    
    table.innerHTML = html
}
async function getTableData() {
    const worksheet = await TimeData.getDataWorkSheet()
    const startDate = moment().subtract(7, 'days')
    const rows = findRowsInRange(worksheet, startDate)
    return rows
}
// parseInt
function generateTable(data){
    // [[null, year, month, date, time], []]
    const trs = data.reduce((rowsum, row) => {
        let tds = row.reduce((sum, cur, idx) => {
            if (idx === 0) return sum
            // security issue
            return sum + `<td>${cur}</td>`
        }, "")
        return rowsum + `<tr>${tds}</tr>`
    }, "")
    const th = `<thead>
      <th>年</th>
      <th>月</th>
      <th>日</th>
      <th>时间</th>
    </thead>`
    return `<table>
    ${th}
    <tbody>
      ${trs}
    </tbody>
    </table>`
}

module.exports = {
    setTimeTable
}