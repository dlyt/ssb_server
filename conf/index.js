'use strict'

var conf = {}

conf.db = require('./db')
conf.promise = require('./promise')
conf.sms = require('./sms')
conf.log = require('./log')
conf.user = require('./user')
conf.const = require('./const')
conf.wechat = require('./wechat')

module.exports = conf
