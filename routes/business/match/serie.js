'use strict'

const lightco = require('lightco')
const express = require('express')
const logger = log4js.getLogger('[routes-business-matchSerie]')
const router = express.Router()
const toInt = Utility.toInt


const { DailyMatchSerie } = Models

router.post('/addMatchSerie',Services.token.business_decode, addMatchSerie)                //添加赛事系列表
router.post('/reviseMatchSerie',Services.token.business_decode, reviseMatchSerie)      //修改比赛系列表
router.get('/serieList',Services.token.business_decode, serieList)
router.get('/serieDetail',Services.token.business_decode, serieDetail)
//router.post('/delMatchSerie',Services.token.business_decode, delMatchSerie)



function addMatchSerie(req, res) {
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
            organization_id: organizationId,
            hot_level: 0,
            need_show: 0,
            secret_id: 2,
        }

        var [err, serie] = yield DailyMatchSerie.create(opts)
        if (err) throw err

        res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function reviseMatchSerie(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.body.name)
            var name = req.body.name
        else
            return res.json(Conf.promise('2','无效的信息'))

        if (req.body.id)
            var id = req.body.id
        else
            return res.json(Conf.promise('2','无效的id'))

        if (req.user.organization_id)
            var organizationId = req.user.organization_id
        else
            return res.json(Conf.promise('2','无效的组织ID'))

        var [err, info] = yield DailyMatchSerie.findById(id)
        if (err) throw err

        info.name = name


        var [err, data] = yield info.save()
        if (err) throw err

        res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function serieList(req, res) {
  lightco.run(function* ($) {
    try {

        const organizationId = req.query.id

        var [err, list] = yield DailyMatchSerie.scope('list').findAll({where: {organization_id: organizationId}})
        if (err) throw err

        res.json(Conf.promise('0',list))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function serieDetail(req, res) {
  lightco.run(function* ($) {
    try {

        const id = req.query.id

        var [err, detail] = yield DailyMatchSerie.scope('list').findById(id)
        if (err) throw err

        res.json(Conf.promise('0', detail))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function delMatchSerie(req, res) {
  lightco.run(function* ($) {
    try {

        const id = req.body.id

        var [err, detail] = yield DailyMatchSerie.destroy({where: {dailyMatchSerie_id: id}})
        if (err) throw err

        res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}





module.exports = router
