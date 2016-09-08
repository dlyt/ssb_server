'use strict'

const util = require('util')
const uuid = require('node-uuid')
const moment = require('moment-timezone');

var utility = {}

/* 修改 日期格式 */
Date.prototype.toJSON = function(){
    return moment(this).tz('Asia/Shanghai').format()
}

/* npm install --unsafe-perm */
utility.des40 = require('./des40')

utility.invalidDate = function(date) {
    return isNaN(date.getTime())
}

utility.fmtId = function(id, nhead, ntail) {
    if (!id || typeof(id) != 'string')
        return id

    let n = id.length

    if (n <= nhead || n <= ntail)
        return id

    let nstar = n - nhead - ntail

    let prefix = id.substr(0, nhead)
    let surplus = id.substr(nhead - n)
    let padding = surplus.substr(-ntail)

    let star = ''
    if (nstar > 0)
        star = (new Array(nstar + 1)).join('*')

    return prefix + star + padding
}

utility.toInt = function(v, def) {
    let n = parseInt(v)
	return isNaN(n) ? (def || 0) : n
}

utility.rand4 = function() {
	return util.format('%d0000', Math.floor(Math.random() * 9999)).substr(0, 4)
}

utility.rand6 = function() {
	return util.format('%d000000', Math.floor(Math.random() * 999999)).substr(0, 6)
}

utility.uuid = function() {
	return uuid.v4()
}

utility.timestamp = function() {
	return Math.floor(Date.now())
}

/* x-real-ip 由nginx转发时添加 */
utility.clientIpV4 = function(req) {
    const ip = req.headers['x-real-ip'] ||
               req.connection.remoteAddress ||
               req.socket.remoteAddress
	return ip.split(':').pop()
}

utility.checkPhone = function(phone) {
	if(!(/^1[3|4|5|7|8]\d{9}$/.test(phone)))
        return false
	return true
}

utility.noncestr = function(length) {
    length = length || 32
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var pos = chars.length
    var nonces = []
    for (var i = 0; i < length; i++) {
        nonces.push(chars.charAt(Math.floor(Math.random() * pos)))
    }
    return nonces.join('')
}

let order_tick = 0
utility.orderId = function() {
	order_tick = (order_tick + 1) % 1000
    let id = process.env.ID || '00'
	let append = util.format('000%d', order_tick).substr(-3)
    return '01' + parseInt(+new Date(), 10) + id + append
}


let payment_tick = 0
utility.paymentId = function() {
	payment_tick = (payment_tick + 1) % 1000
    let id = process.env.ID || '00'
	let append = util.format('000%d', payment_tick).substr(-3)
    return '02' + parseInt(+new Date(), 10) + id + append
}

utility.dateFormat = function(date, format) {
    format = format || 'MMddhhmm'
    var o = {
        "M+": date.getMonth() + 1, //month
        "d+": date.getDate(), //day
        "h+": date.getHours(), //hour
        "m+": date.getMinutes(), //minute
        "s+": date.getSeconds(), //second
        "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
        "S": date.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
    }

    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length))
        }
    }
    return format
}

utility.checkIdCard = function(card) {
    if (!card || typeof card != 'string')
        return false

    //校验长度，类型
    if(isCardNo(card) === false) {
        return false
    }
    //校验生日
    if(checkBirthday(card) === false) {
        console.log('您输入的身份证号码生日不正确,请重新输入')
        return false
    }
    //检验位的检测
    if(checkParity(card) === false) {
        console.log('您的身份证校验位不正确,请重新输入')
        return false
    }
    return true

    //检查号码是否符合规范，包括长度，类型
    function isCardNo (card) {
        //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
        var reg = /(^\d{15}$)|(^\d{17}(\d|X)$)/
        if(reg.test(card) === false) {
            return false
        }
        return true
    }

    //检查生日是否正确
    function checkBirthday(card) {
        var len = card.length
        //身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字
        if(len == '15') {
            var re_fifteen = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/
            var arr_data = card.match(re_fifteen)
            var year = arr_data[2]
            var month = arr_data[3]
            var day = arr_data[4]
            var birthday = new Date('19'+year+'/'+month+'/'+day)
            return verifyBirthday('19'+year,month,day,birthday)
        }
        //身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X
        if(len == '18') {
            var re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/
            var arr_data = card.match(re_eighteen)
            var year = arr_data[2]
            var month = arr_data[3]
            var day = arr_data[4]
            var birthday = new Date(year+'/'+month+'/'+day)
            return verifyBirthday(year,month,day,birthday)
        }
        return false
    }

    //校验日期
    function verifyBirthday(year,month,day,birthday) {
        var now = new Date()
        var now_year = now.getFullYear()
        //年月日是否合理
        if(birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
            //判断年份的范围（3岁到130岁之间)
            var time = now_year - year
            if(time >= 3 && time <= 130)
                return true
        }
        return false
    }

    //校验位的检测
    function checkParity(card) {
        card = changeFivteenToEighteen(card)
        var len = card.length
        if(len == '18') {
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2)
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2')
            var cardTemp = 0, i, valnum
            for(i = 0; i < 17; i++) {
                cardTemp += card.substr(i, 1) * arrInt[i]
            }
            valnum = arrCh[cardTemp % 11]
            if (valnum == card.substr(17, 1))
                return true
        }
        return false
    }

    //15位转18位身份证号
    function changeFivteenToEighteen(card) {
        if(card.length == '15') {
            var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2)
            var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2')
            var cardTemp = 0, i
            card = card.substr(0, 6) + '19' + card.substr(6, card.length - 6)
            for(i = 0; i < 17; i ++) {
                cardTemp += card.substr(i, 1) * arrInt[i]
            }
            card += arrCh[cardTemp % 11]
            return card
        }
        return card
    }
}

utility.checkName = function(name) {
	if (!name || typeof name !== 'string' || name === '')
        return false
    /* 数据库长度限制 */
    if (name.length > 20)
        return false
	return true
}

utility.checkPassportID = function(id) {
	if (!id || typeof id !== 'string' || id === '')
        return false
    if (id.length > 30)
        return false
	return true
}

utility.checkOneWayPermit = function(id) {
	if (!id || typeof id !== 'string' || id === '')
        return false
    if (id.length > 30)
        return false
	return true
}

module.exports = utility
