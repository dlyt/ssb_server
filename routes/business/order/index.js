'use strict'

const lightco = require('lightco')
const request = require('request')
const express = require('express')
const logger = log4js.getLogger('[routes-business-order]')
const router = express.Router()
const toInt = Utility.toInt


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


router.post('/query', Services.token.business_decode, query)          //订单查询


function query(req, res) {
  lightco.run(function* ($) {
    try {

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
            offset: toInt(req.body.offset, 0),
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




module.exports = router
