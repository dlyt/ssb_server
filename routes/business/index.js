'use strict'

const lightco = require('lightco')
const request = require('request')
const express = require('express')
const logger = log4js.getLogger('[routes-business]')
const router = express.Router()
const bcrypt = require('bcrypt');
const moment = require('moment')
const toInt = Utility.toInt

const jwt = require('jsonwebtoken')
const secret = Conf.user.jwt.secret
const expire = Conf.user.jwt.expire
const cache = require('../../services/cache')

var SALT_WORK_FACTOR = 10

const { SerialNumber,
        BigMatchSerie,
        DailyMatchSerie,
        DailyMatch,
        OrderDetail,
        Business,
        BigMatch,
        Payment,
        User,
        Order,        } = Models


router.all('*', head)
router.use('/ticket', require('./ticket'))
router.use('/order', require('./order'))
router.use('/match', require('./match'))
router.use('/vip', require('./vip'))
router.post('/login', login)
router.post('/logout', Services.token.business_decode, logout)
router.post('/info', Services.token.business_decode, info)            //获取信息
router.post('/rest', rest)                                            //修改密码
router.post('/register', register)                                    //注册
router.post('/Validate', Services.token.business_decode, Validate)    //验证


//请求头验证
function head(req, res, next){
      res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');
      next()
}

//token验证
function Validate(req, res) {
      res.json(Conf.promise('0', 'OK'))
}


function login(req, res, next){
  lightco.run(function* ($) {
    try {

      if (req.body.account)
          var account = req.body.account

      if (req.body.password)
          var password = req.body.password

      const opt = {
          where : {
            account : account,
          },
          //raw : true,
      }

      var [err, business_user] = yield Business.scope('detail').findOne(opt)
      if (err) throw err

      var user_password = business_user.password

      if (business_user.length == 0 ) {
          res.json('Username is not exist')
      } else {

          const isMatch = bcrypt.compareSync(password, user_password)

          if (isMatch) {
                var [err, jwt] = yield Services.token.encode(business_user, $)
                if (err) throw err

                return res.json(Conf.promise('0', jwt))
          } else {
                let pack = Conf.promise('1', 'Login failure')
                return  res.json(pack)
          }
      }

    } catch (e) {
        logger.warn(e)
        return res.json(Conf.promise('1'))
    }

  })

}



function logout(req, res) {
  lightco.run(function* ($) {
    try {

      const user = req.user
      var [err] = yield Services.token.del(user, $)
      if (err) throw err

      return res.json(Conf.promise('0'))

    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}


//获取个人信息
function info(req, res) {
  lightco.run(function* ($) {
    try {

      const user = req.user

      const result = {
          organizationId: user.organization_id,
          businessName: user.name,
          role: user.role,
      }

      return res.json(Conf.promise('0', result))

    } catch (e) {
      logger.warn(e)
      res.json(Conf.promise('1'))
    }
  })
}

function rest(req, res){
  lightco.run(function* ($) {
    try {

      if (req.body.name)
          var account = req.body.name

      if (req.body.password)
          var password = req.body.password

      if (req.body.new_password)
          var business_new_password = req.body.new_password

      var opt = {
        where : {
          account : account,
        },
        individualHooks : true,
        raw : true,
      }

      var date = {
        business_password : business_new_password,
      }

      var [err, business_user] = yield Business.findOne(opt)
      if (err) throw err

      var user_password = business_user.password

      if (business_user.length == 0 ) {
          return  res.json('Username is not exist')
      } else {
          const isMatch = bcrypt.compareSync(password,user_password)
          if (!isMatch) {
                return res.json(Conf.promise('1','密码匹配错误'))
          }
      }

      //密码加密
      var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
      var hash = bcrypt.hashSync(date.business_password, salt);

      var value = {
            password : hash,
            last_update : moment().format('YYYY-MM-DD HH:mm:ss'),
      }

      var [err] = yield Business.update(value, opt)
      if (err) throw (err);


      res.json(Conf.promise('0'))


    } catch (e) {
        logger.warn(e)
        return res.json(Conf.promise('1'))
    }

  })

}

function register(req, res){
  lightco.run(function* ($) {
    try {

      let createAt = new Date()

      if (req.body.organizationId)
          var organization_id = req.body.organizationId

      if (req.body.name)
          var name = req.body.name

      if (req.body.account)
          var account = req.body.account

      if (req.body.password)
          var password = req.body.password

      if (req.body.role)
          var role = req.body.role

      var [err, user] = yield Business.findOne({where: {account: account}})
      if (err) throw err

      if (user)
          return res.json(Conf.promise('5003'))

      const opt = {
          organization_id : organization_id,
          name : name,
          account : account,
          password : password,
          role : role,
          createAt : createAt,
      }

      var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
      var hash = bcrypt.hashSync(opt.password, salt);

      opt.password = hash

      var [err] = yield Business.create(opt)
      if (err) throw err

      res.json(Conf.promise('0'))
    } catch (e) {
        logger.warn(e)
        return res.json(Conf.promise('1'))
    }

})

}


module.exports = router
