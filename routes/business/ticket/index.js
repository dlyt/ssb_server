'use strict'

const lightco = require('lightco')
const request = require('request')
const express = require('express')
const logger = log4js.getLogger('[routes-business-ticket]')
const router = express.Router()
const moment = require('moment')


const { SerialNumber,
        BigMatchSerie,
        CasinoVip,
        DailyMatchSerie,
        DailyMatch,
        OrderDetail,
        Business,
        BigMatch,
        User,
        Order,        } = Models


router.post('/verify',Services.token.business_decode, verify)         //门票验证
router.post('/use', Services.token.business_decode, use)              //使用门票



function verify(req, res) {
  lightco.run(function* ($) {
    try {

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

        var [err, vip] = yield CasinoVip.findOne({where: {organization_id: organizationId, user_id: orderInfo.user_id}})
        if (err) throw err

        const MatchSerie = matchInfo.dataValues.dailyMatchSerie ? matchInfo.dataValues.dailyMatchSerie : matchInfo.dataValues.bigMatchSerie

        const MatchName = MatchSerie.dataValues.name
        const MatchPrice = matchInfo.dataValues.unit_price

        const date = {
            seria_No: orderInfo.seria_No,
            match_Name: MatchName,
            user_id: orderInfo.user_id,
            user_Name: order.user.realName,
            user_Mobile: order.user.mobile,
            unit_Price: MatchPrice,
            serial_Status: orderInfo.have_used,
            cardno: vip.cardno,
        }

        res.json(Conf.promise('0', date))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}


function use(req, res) {
  lightco.run(function* ($) {
    try {

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



module.exports = router
