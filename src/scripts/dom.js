const byId = id => document.getElementById(id)
const bindListener = (ele, event, handler, options) => {
    ele.addEventListener(event, handler, options)
}
const addClass = (ele, classNames) => {
    const classList = classNames.split(/\s+/g)
    classList.forEach(className => {
        ele.classList.add(className)
    })
    
}
const removeClass = (ele, className) => {
    ele.classList.remove(className)
}
const setAttr = (ele, attr, value) => {
    ele.setAttribute(attr, value)
}
const appendInBody = ele => {
    document.body.appendChild(ele)
}
module.exports = {
    byId,
    bindListener,
    addClass,
    removeClass,
    setAttr,
    appendInBody
}