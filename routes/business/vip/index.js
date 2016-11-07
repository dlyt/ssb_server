'use strict'

const lightco = require('lightco')
const request = require('request')
const express = require('express')
const logger = log4js.getLogger('[routes-business]')
const router = express.Router()
const toInt = Utility.toInt


const { CasinoVip } = Models


router.post('/add',Services.token.business_decode, add)          //添加会员
router.post('/reviseMatchSetting',Services.token.business_decode, reviseMatchSetting)          //修改比赛结构表
router.get('/settingList',Services.token.business_decode, settingList)
router.get('/settingDetail',Services.token.business_decode, settingDetail)

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
            return res.json(Conf.promise('2','会员卡号已存在'))

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

function reviseMatchSetting(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.body.matchSettingData)
            var matchSettingData = req.body.matchSettingData
        else
            return res.json(Conf.promise('2','无效的信息'))

        if (!matchSettingData.organizationId)
            return res.json(Conf.promise('2','无效的组织ID'))

        var [err, info] = yield MatchSetting.findById(matchSettingData.id)
        if (err) throw err

        info.name = matchSettingData.name
        info.blindTime = matchSettingData.blindTime
        info.chip = matchSettingData.chip
        info.bonuses = matchSettingData.bonuses
        info.setting = matchSettingData.setting

        var [err, data] = yield info.save()
        if (err) throw err

        res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function settingList(req, res) {
  lightco.run(function* ($) {
    try {

        const organizationId = req.user.organization_id

        var [err, list] = yield MatchSetting.scope('list').findAll({where: {organization_id: organizationId}})
        if (err) throw err

        res.json(Conf.promise('0',list))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function settingDetail(req, res) {
  lightco.run(function* ($) {
    try {

        const id = req.query.id

        var [err, detail] = yield MatchSetting.scope('detail').findById(id)
        if (err) throw err


        res.json(Conf.promise('0', detail))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}




module.exports = router
