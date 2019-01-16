const {addClass, removeClass,setAttr, bindListener, appendInBody} = require('../../scripts/dom')

module.exports = (function() {
    let instance

    function _alert(txt) {
        if (!instance) {
            instance = new Alert()
        }
        instance.show(txt)
        return instance
    }
    function Alert() {
        this.init()
    }
    Alert.prototype.init = function() {
        this.box = null
        this.txt = null
        this.textBox = null
        this.createElement()
        this.bind()
    }
    Alert.prototype.createElement = function() {
        let box = this.box = document.createElement('div')
        let confirmBtn = this.confirmBtn = document.createElement('button')
        let textBox = this.textBox = document.createElement('div')
        confirmBtn.innerText = '确定'
        addClass(box, 'dialog-box alert-box hide')
        addClass(confirmBtn, 'alert-btn')
        addClass(textBox, 'dialog-txt alert-txt')
        box.appendChild(textBox)
        box.appendChild(confirmBtn)
        appendInBody(box)
    }
    Alert.prototype.bind = function() {
        bindListener(this.confirmBtn, 'click', clickConfirm.bind(this))
    }
    function clickConfirm() {
        addClass(this.box, 'hide')
    }
    Alert.prototype.show = function(txt) {
        this.textBox.innerText = txt
        removeClass(this.box, 'hide')
    }
    Alert.prototype.hide = function() {

    }
    return _alert
})()
