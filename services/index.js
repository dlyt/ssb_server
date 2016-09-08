'use strict'

var services = {}

services.cache = require('./cache')
services.sms = require('./sms')
services.token = require('./token')
services.wechat = require('./wechat')

module.exports = services
