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

router.all('/login', login)
router.all('/logout', decode, logout)
router.all('/verify',decode, verify)         //门票验证
router.all('/use', decode, use)              //使用门票
router.all('/query', decode, query)          //订单查询
router.all('/info', decode, info)            //获取信息
router.all('/rest', rest)                    //修改密码
router.get('/register', register)            //注册
router.all('/Validate', decode, Validate)    //验证



//登录
function login(req, res, next){
  lightco.run(function* ($) {
    try {
      res.header("Access-Control-Allow-Origin", "https://ht.91buyin.com");

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


//退出登录
function logout(req, res) {
  lightco.run(function* ($) {
    try {
      res.header("Access-Control-Allow-Origin", "https://ht.91buyin.com");
      res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');

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

//门票验证
function verify(req, res) {
  lightco.run(function* ($) {
    try {
      res.header("Access-Control-Allow-Origin", "https://ht.91buyin.com");
      res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');

        if(req.body.serial) {
          var serial = {seria_No : req.body.serial}
        } else {
          return res.json(Conf.promise('1', 'serial is not correct'))
        }

        if (req.user.organization_id)
            var organizationId = req.user.organization_id

        const include = [{
            model: OrderDetail,
            include: [{
                model: Order, attributes: ['organization_id', 'bigMatch_id', 'dailyMatch_id'],
                include: [{
                    model: User, attributes: ['realName','mobile']
                }]
            }]
        }]

        let opts = {
            include: include,
            where: serial || {},
            //logging: true,
            //raw: true,
        }

        var [err, orderInfo] = yield  SerialNumber.findOne(opts)
        if (err) throw err

        if (orderInfo == null)
            return res.json(Conf.promise('5001'))

        const organization_id = orderInfo.orderDetail.order.dataValues.organization_id
        if (organization_id !== organizationId)
            return res.json(Conf.promise('5002'))


        const order = orderInfo.orderDetail.order
        const Match = order.bigMatch_id ? BigMatch : DailyMatch
        const Match_id = order.bigMatch_id ? order.bigMatch_id : order.dailyMatch_id
        const Serie = order.bigMatch_id ? BigMatchSerie : DailyMatchSerie
        const id = order.bigMatch_id ? {'bigMatch_id': Match_id} : {'dailyMatch_id': Match_id}

        let matchOpts = {
            include: [{
                model: Serie,
            }],
            where: id,
            //raw: true,
        }

        var [err, matchInfo] = yield Match.findOne(matchOpts)
        if (err) throw err

        const MatchSerie = matchInfo.dataValues.dailyMatchSerie ? matchInfo.dataValues.dailyMatchSerie : matchInfo.dataValues.bigMatchSerie

        const MatchName = MatchSerie.dataValues.name
        const MatchPrice = matchInfo.dataValues.unit_price

        const date = {
            seria_No: orderInfo.seria_No,
            match_Name: MatchName,
            user_Name: order.user.realName,
            user_Mobile: order.user.mobile,
            unit_Price: MatchPrice,
            serial_Status: orderInfo.have_used,
        }

        res.json(Conf.promise('0', date))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

//使用门票
function use(req, res) {
  lightco.run(function* ($) {
    try {

      res.header("Access-Control-Allow-Origin", "https://ht.91buyin.com");
      res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');

      if(req.body.serial) {
        var serial = {seria_No : req.body.serial}
      } else {
        return res.json(Conf.promise('1', 'serial is not correct'))
      }

      const opt = {
          where: serial || {},
      }

      const value = {
          have_used: 1,
          used_time: moment().format('YYYY-MM-DD HH:mm:ss'),
          last_update: moment().format('YYYY-MM-DD HH:mm:ss'),
      }

      var [err] = yield SerialNumber.update(value, opt)
      if (err) throw err

       res.json(Conf.promise('0'))
    } catch (e) {
      return res.json(Conf.promise('1'))
    } finally {

    }
  })
}


//订单查询
function query(req, res) {
  lightco.run(function* ($) {
    try {

        res.header("Access-Control-Allow-Origin", "https://ht.91buyin.com");
        res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');

        const def = Conf.const.business.limit_def
        const max = Conf.const.business.limit_max

        let query = [{have_pay : 1}]

        let payment = [{trade_state: 'SUCCESS'}]

        if (req.body.organizationId) {
              var organization_id = req.body.organizationId
              query.push({organization_id: req.body.organizationId})
        }


        if (req.body.have_clearing) {
              var clear = req.body.have_clearing
              query.push({have_clearing : req.body.have_clearing})
        }


        if (req.body.start_day) {
              var start_day = new Date(Date.parse(req.body.start_day.replace(/-/g, "/")))
              payment.push({pay_datetime : {$gt: start_day}})
        }

        if (req.body.end_day) {
              var end_day = new Date(Date.parse(req.body.end_day.replace(/-/g, "/")))
              payment.push({pay_datetime : {$lte: end_day}})
        }

        const include = [{
            model: User, attributes: ['realname', 'mobile'],
        },{
            model: Payment, attributes: ['pay_datetime'],
            where: {$and: payment},
        }]

        let opts = {
            where: {$and: query},
            include: include,
            order: [['order_id', req.query.order || 'ASC']],
            offset: toInt(req.query.offset, 0),
            limit: toInt(def),
            //raw: true,
            //logging: true,
        }


        const [err, orderInfo] = yield Order.findAndCountAll(opts)
        if (err) throw err

        var data = orderInfo.rows

        for (var i = 0 , length = data.length; i < length; i++) {
              var bigMatch_id = data[i].dataValues.bigMatch_id
              var dailyMatch_id = data[i].dataValues.dailyMatch_id

              if (bigMatch_id == null) {
                    const opt = {
                        include: [{
                            model: DailyMatchSerie,
                        }],
                        where: {'dailyMatch_id': dailyMatch_id}
                    }

                    var [error, casinoName] = yield DailyMatch.find(opt)
                    if (error) throw error

                    data[i].dataValues.matchName = casinoName.dailyMatchSerie.name
              } else {
                    const opt = {
                        include: [{
                            model: BigMatchSerie,
                        }],
                        where: {'bigMatch_id': bigMatch_id}
                    }
                    var [error, casinoName] = yield BigMatch.find(opt)
                    if (error) throw error

                    data[i].dataValues.matchName = casinoName.bigMatchSerie.name
              }
        }


        var sql =" select SUM(`order`.amount) as amount FROM `order` " +
                      "INNER JOIN payment on order.order_id = payment.order_id " +
            	        " where  organization_id = " + organization_id +
            	        " and    have_pay = '1'  " +
            	        " and    trade_state = 'SUCCESS' " +
                      " and    pay_datetime > " +  " \"" + req.body.start_day + "\" " +
                      " and    pay_datetime < " + " \"" + req.body.end_day + "\" "

        if (clear) sql += " and    have_clearing = " + " \"" + clear + "\" "

        sequelize.query(sql, { type: sequelize.QueryTypes.SELECT}).then(function (results) {
               orderInfo.amount =  results[0].amount

               let pack = res.json(Conf.promise('0', orderInfo))
        })



    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}


function decode(req, res, next) {
    lightco.run(function*($) {
        try {
            res.header("Access-Control-Allow-Origin", "https://ht.91buyin.com");
            res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');

            var _token
            if (req.headers && req.headers.authorization) {
                var parts = req.headers.authorization.split(' ')
                if (parts.length == 2) {
                    var scheme = parts[0]
                    var credentials = parts[1]
                    if (/^Bearer$/i.test(scheme))
                        _token = credentials
                }
            }
            if (!_token)
                return res.json(Conf.promise('1010'))

            var [err, decoded] = yield jwt.verify(_token, secret, $)
            if (err || !decoded) {
                return res.json(Conf.promise('1009'))
            }

            var id = decoded.id || ''
            var [err, token] = yield cache.hget('jsonwebtoken', id, $)
            if (err) throw err

            if (_token != token)
                return res.json(Conf.promise('1009'))

            var [err, user] = yield Business.findById(id)
            if (err) throw err

            req.user = user
            return next()

        } catch (e) {
            logger.warn(e)
            res.json(Conf.promise('1'))
        }
    })
}


//获取个人信息
function info(req, res) {
  lightco.run(function* ($) {
    try {
      res.header("Access-Control-Allow-Origin", "https://ht.91buyin.com");
      res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');

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
      res.header("Access-Control-Allow-Origin", "https://ht.91buyin.com");
      res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');

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

//token验证
function Validate(req, res) {
      res.header("Access-Control-Allow-Origin", "https://ht.91buyin.com");
      res.header('Access-Control-Allow-Headers', 'Content-Type, authorization');

      res.json(Conf.promise('0', 'OK'))
}

function register(req, res){
  lightco.run(function* ($) {
    try {

      let createAt = new Date()

      var opt = {
          business_id : '1',
          organization_id : '22',
          name : '跑跑',
          account : '1',
          password : '1',
          createAt : createAt,
      }

      var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
      var hash = bcrypt.hashSync(opt.password, salt);

      opt.password = hash

      var [err] = yield Business.create(opt)
      if (err) throw err

      res.json('ok')
    } catch (e) {
        logger.warn(e)
        return res.json(Conf.promise('1'))
    }

})

}


module.exports = router
