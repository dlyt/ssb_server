'use strict'

const lightco = require('lightco')
const express = require('express')
const logger = log4js.getLogger('[routes-business-matchSetting]')
const router = express.Router()
const toInt = Utility.toInt


const { MatchSetting } = Models


router.post('/addMatchSetting',Services.token.business_decode, addMatchSetting)                //添加比赛结构表
router.post('/reviseMatchSetting',Services.token.business_decode, reviseMatchSetting)          //修改比赛结构表
router.get('/settingList',Services.token.business_decode, settingList)
router.get('/settingDetail',Services.token.business_decode, settingDetail)
//router.post('/delSetting',Services.token.business_decode, delSetting)



function addMatchSetting(req, res) {
  lightco.run(function* ($) {
    try {
        if (req.body.matchSettingData)
            var matchSettingData = req.body.matchSettingData
        else
            return res.json(Conf.promise('2','无效的信息'))

        if (!matchSettingData.organizationId)
            return res.json(Conf.promise('2','无效的组织ID'))

        const opts = {
            name: matchSettingData.name,
            blindTime: matchSettingData.blindTime,
            chip: matchSettingData.chip,
            bonuses: matchSettingData.bonuses,
            setting: matchSettingData.setting,
            remark: matchSettingData.remark,
            organization_id: matchSettingData.organizationId,
        }


        var [err, setting] = yield MatchSetting.create(opts)
        if (err) throw err

        res.json(Conf.promise('0'))


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
        info.remark = matchSettingData.remark

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

        if (detail.chip === null)
            detail.chip = ''

        if (detail.blindTime === null)
            detail.blindTime = ''


        res.json(Conf.promise('0', detail))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function delSetting(req, res) {
  lightco.run(function* ($) {
    try {

        const id = req.body.id

        var [err, detail] = yield MatchSetting.destroy({where: {matchSetting_id: id}})
        if (err) throw err


        res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}





module.exports = router
