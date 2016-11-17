'use strict'

const lightco = require('lightco')
const express = require('express')
const logger = log4js.getLogger('[routes-business-bigMatch]')
const router = express.Router()
const toInt = Utility.toInt


const { BigMatchTour,
        DailyMatchSerie,
        MatchSetting,    } = Models

router.get('/tourList', tourList)                //巡回赛列表
router.post('/addTour',Services.token.business_decode, addTour)                         //赛事列表
//router.post('/reviseMatchSetting',Services.token.business_decode, reviseMatchSetting)
router.get('/detail',Services.token.business_decode, detail)



function tourList(req, res) {
  lightco.run(function* ($) {
    try {

        var [err, tourList] = yield BigMatchTour.findAll()
        if (err) throw err

        res.json(Conf.promise('0', tourList))


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

function addTour(req, res) {
  lightco.run(function* ($) {
    try {

      if (req.body.name)
          var name = req.body.name
      else
          return res.json(Conf.promise('2','无效的信息'))

      if (req.user.organization_id)
          var organizationId = req.user.organization_id
      else
          return res.json(Conf.promise('2','无效的组织ID'))

      const opts = {
          name: name,
      }

      var [err, tour] = yield BigMatchTour.create(opts)
      if (err) throw err

      res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function detail(req, res) {
  lightco.run(function* ($) {
    try {

        const id = req.query.id

        const opts = {
            include: [{
                model: DailyMatchSerie, attributes: ['name'],
            },{
                model: MatchSetting, attributes: ['name'],
            }],
            where: {dailyMatch_id: id}
        }

        var [err, detail] = yield DailyMatch.scope('detail').find(opts)
        if (err) throw err

        res.json(Conf.promise('0', detail))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}


module.exports = router
