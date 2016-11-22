'use strict'

const lightco = require('lightco')
const express = require('express')
const logger = log4js.getLogger('[routes-business-bigMatch]')
const router = express.Router()
const toInt = Utility.toInt


const { DailyMatch,
        DailyMatchSerie,
        DailyMatchResult,
        MatchSetting,    } = Models

router.get('/result', result)                                                                 //日赛结果
router.post('/addResult',Services.token.business_decode, addResult)                           //赛事列表
router.post('/reviseDailyMatchResult',Services.token.business_decode, reviseDailyMatchResult)
router.get('/getResult', getResult)



function result(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.query.id)
            var id = req.query.id
        else
            return res.json(Conf.promise('2', '信息不全'))

        if (req.query.matchDay)
            var matchDay = req.query.matchDay
        else
            return res.json(Conf.promise('2', '信息不全'))

        const opts = {
            include: [{
                model: DailyMatchSerie, attributes: ['organization_id', 'name'],
                where: {organization_id: id}
            },{
                model: DailyMatchResult, attributes: ['dailyMatchResult_id', 'name']
            }],
            where: {match_day: matchDay}
        }

        var [err, result] = yield DailyMatch.scope('list').findAndCountAll(opts)
        if (err) throw err

        res.json(Conf.promise('0', result))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function reviseDailyMatchResult(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.body.id)
            var id = req.body.id
        else
            return res.json(Conf.promise('2','信息不全'))

        if (req.body.result)
            var result = req.body.result
        else
            return res.json(Conf.promise('2','信息不全'))

        var [err, info] = yield DailyMatchResult.find({where: {dailyMatch_id: id}})
        if (err) throw err

        info.name = req.body.name
        info.result = result

        var [err, data] = yield info.save()
        if (err) throw err

        res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function addResult(req, res) {
  lightco.run(function* ($) {
    try {

      if (req.body.id)
          var id = req.body.id
      else
          return res.json(Conf.promise('2','信息不全'))

      if (req.body.result)
          var result = req.body.result
      else
          return res.json(Conf.promise('2','信息不全'))

      const name = req.body.name ? req.body.name : ''

      const opts = {
          dailyMatch_id: id,
          name: name,
          result: JSON.stringify(result),
      }

      var [err, result] = yield DailyMatchResult.create(opts)
      if (err) throw err

      res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function getResult(req, res) {
  lightco.run(function* ($) {
    try {

        const id = req.query.id

        const opts = {
            attributes: ['name', 'result'],
            where: {dailyMatch_id: id}
        }

        var [err, detail] = yield DailyMatchResult.find(opts)
        if (err) throw err

        res.json(Conf.promise('0', detail))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}


module.exports = router
