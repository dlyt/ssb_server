'use strict'

const lightco = require('lightco')
const request = require('request')
const express = require('express')
const logger = log4js.getLogger('[routes-business-vip]')
const router = express.Router()
const toInt = Utility.toInt


const { CasinoVip, User } = Models


router.post('/add',Services.token.business_decode, add)          //添加会员
router.post('/query',Services.token.business_decode, query)      //查询会员信息



function add(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.body.userId)
            var userId = req.body.userId
        else
            return res.json(Conf.promise('2','无效的用户Id'))

        if (req.body.card)
            var cardno = req.body.card
        else
            return res.json(Conf.promise('2','无效的会员卡号'))

        if (req.user.organization_id)
            var organizationId = req.user.organization_id
        else
            return res.json(Conf.promise('2','无效的组织ID'))

        var [err, vip] = yield CasinoVip.findOne({where: {organization_id: organizationId, cardno: cardno}})
        if (err) throw err

        if (vip)
            return res.json(Conf.promise('7002','会员卡号已存在'))

        const opts = {
            organization_id: organizationId,
            user_id: userId,
            cardno: cardno,
        }

        var [err, vip] = yield CasinoVip.create(opts)
        if (err) throw err

        res.json(Conf.promise('0', vip.cardno))


    } catch (e) {
        logger.warn(e)
        return res.json(Conf.promise('1'))
    }
  })
}

function query(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.body.cardno)
            var cardno = req.body.cardno
        else
            return res.json(Conf.promise('2','无效的会员卡号'))

        if (req.user.organization_id)
            var organizationId = req.user.organization_id
        else
            return res.json(Conf.promise('2','无效的组织ID'))

        const opts = {
            attributes: ['cardno'],
            include: [{
              model: User, attributes: ['realName', 'rickName', 'mobile', 'idCard'],
            }],
            where: {organization_id: organizationId, cardno: cardno},
        }

        var [err, vip] = yield CasinoVip.findOne(opts)
        if (err) throw err

        if (vip)
            res.json(Conf.promise('0', vip))
        else
            return res.json(Conf.promise('7001','会员卡号不存在'))

    } catch (e) {
        logger.warn(e)
        return res.json(Conf.promise('1'))
    }
  })
}




module.exports = router
