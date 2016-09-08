'use strict'

var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var xmlBodyParser = require('express-xml-parser')
var Sequelize = require('sequelize')
var crypto = require('crypto')
var fs = require('fs')
var log4js = require('log4js')
var lightco = require('lightco')

/* 全局访问 */
global.Conf = require('./conf')
global.log4js = log4js, log4js.configure(Conf.log.log4js)
global.Promise = require('bluebird')
global.Models = require('./models').t
global.sequelize = require('./models').db
global.Services = require('./services')
global.Utility = require('./utility')
global.Unify = require('./unify')

var moment = require('moment');

console.log(new Date())
console.log(new Date( moment().add(7, 'days')))
console.log(0 || 1)

/* app 实例 */
var app = express()

/* 设置模板引擎 */
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('x-powered-by', true)

/* 图标 */
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

/* 设置中间件 */
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(xmlBodyParser({
    explicitArray: false,
    ignoreAttrs: true,
    type: 'text/xml',
    limit: '1mb'
}))
//app.use(cookieParser())

/* 静态文件 */
app.use(express.static(path.join(__dirname, 'public')))

/* 设置路由 */
var routes = require('./routes')
app.use(routes)

/* 错误处理-开发环境 */
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

/* 错误处理-生产环境 */
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

/* 404 */
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

module.exports = app
