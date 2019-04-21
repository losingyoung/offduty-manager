const moment = require('moment')
exports.inRange = (num, {min = 0, max = Infinity}) => {
    num = parseInt(num)
    if (Number.isNaN(num)) {
        return false
    }
    if (num < min || num > max) {
        return false
    }
    return true
}
exports.zip = (arr1, arr2, fn) => {
    for(let i = 0; i < arr1.length; i++) {
        if (fn(arr1[i], arr2[i], i) === false) {
            return false
        }
    }
    return true
}
exports.isDate = time => {
    return Object.prototype.toString.call(time) === "[object Date]"
}
exports.getYear = () => moment().year()
exports.getMonth = () => moment().month() + 1
exports.getDate = () => moment().date()
exports.isRenderer = () => {
    // running in a web browser
    if (typeof process === 'undefined') return true
  
    // node-integration is disabled
    if (!process) return true
  
    // We're in node.js somehow
    if (!process.type) return false
  
    return process.type === 'renderer'
}
