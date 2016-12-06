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

        var Query = []
        var query = [{have_used: 1}]

        if (req.user.organization_id) {
              var organization_id = req.user.organization_id
              Query.push({organization_id: req.user.organization_id})
        }

        if (req.body.have_clearing) {
              var clear = req.body.have_clearing
              Query.push({have_clearing: req.body.have_clearing})
        }

        if (req.body.startTime) {
              var startTime = new Date(req.body.startTime)
              query.push({used_time : {$gt: startTime}})
        }

        if (req.body.endTime) {
              var endTime = new Date(req.body.endTime)
              query.push({used_time : {$lte: endTime}})
        }


        const include = [{
            model: User, attributes: ['realname', 'mobile'],
        },{
            model: OrderDetail, attributes: ['orderDetail_id'],
            include: [{
                model: Order, attributes: ['order_No', 'have_clearing'],
                include: [{
                    model: BigMatch, attributes: ['unit_price'],
                    include: [{
                        model: BigMatchSerie, attributes: ['name']
                    }]
                },{
                    model: DailyMatch, attributes: ['unit_price'],
                    include: [{
                        model: DailyMatchSerie, attributes: ['name']
                    }]
                }],
                where: {$and: Query},
            }]
        }]

        let opts = {
            where: {$and: query},
            include: include,
            //order: [['order_id', req.query.order || 'ASC']],
            offset: toInt(req.body.offset, 0),
            limit: toInt(def),
            attributes: ['used_time'],
            //raw: true,
            //logging: true,
        }


        const [err, orderInfo] = yield SerialNumber.findAndCountAll(opts)
        if (err) throw err

        var sql =" SELECT   sum(`orderDetail.order.bigMatch`.`unit_price`) AS `bigMatchPrice`  ,sum(`orderDetail.order.dailyMatch`.`unit_price`) AS `dailyMatchPrice` FROM `serialNumber` " +
                      "LEFT OUTER JOIN `orderDetail`  ON `serialNumber`.`orderDetail_id` = `orderDetail`.`orderDetail_id` INNER JOIN `order` AS `orderDetail.order` ON `orderDetail`.`order_id` = `orderDetail.order`.`order_id` LEFT OUTER JOIN `bigMatch` AS `orderDetail.order.bigMatch` ON `orderDetail.order`.`bigMatch_id` = `orderDetail.order.bigMatch`.`bigMatch_id` LEFT OUTER JOIN `bigMatchSerie` AS `orderDetail.order.bigMatch.bigMatchSerie` ON `orderDetail.order.bigMatch`.`bigMatchSerie_id` = `orderDetail.order.bigMatch.bigMatchSerie`.`bigMatchSerie_id` LEFT OUTER JOIN `dailyMatch` AS `orderDetail.order.dailyMatch` ON `orderDetail.order`.`dailyMatch_id` = `orderDetail.order.dailyMatch`.`dailyMatch_id` LEFT OUTER JOIN `dailyMatchSerie` AS `orderDetail.order.dailyMatch.dailyMatchSerie` ON `orderDetail.order.dailyMatch`.`dailyMatchSerie_id` = `orderDetail.order.dailyMatch.dailyMatchSerie`.`dailyMatchSerie_id`" +
            	        " where  `orderDetail.order`.`organization_id` = " + organization_id +
            	        " and    `serialNumber`.`have_used` = '1'  " +
                      " and    `serialNumber`.`used_time` > " +  " \"" + req.body.startTime + "\" " +
                      " and    `serialNumber`.`used_time` < " + " \"" + req.body.endTime + "\" "


        if (clear) sql += " and    `orderDetail.order`.`have_clearing` = " +  clear

        sequelize.query(sql, { type: sequelize.QueryTypes.SELECT}).then(function (results) {
               orderInfo.amount =  results[0].bigMatchPrice +  results[0].dailyMatchPrice
               return res.json(Conf.promise('0', orderInfo))
        })



    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}




module.exports = router
