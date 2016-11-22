'use strict'

const lightco = require('lightco')
const request = require('request')
const express = require('express')
const logger = log4js.getLogger('[routes-business-match]')
const router = express.Router()
const toInt = Utility.toInt


const { DailyMatch,
        DailyMatchSerie,
        MatchSetting,    } = Models

router.use('/bigMatch', require('./bigMatch'))
router.use('/dailyMatch', require('./dailyMatch'))
router.use('/serie', require('./serie'))
router.use('/setting', require('./setting'))
router.post('/addMatch',Services.token.business_decode, addMatch)                //添加赛事
router.get('/list',Services.token.business_decode, list)                         //赛事列表
//router.post('/reviseMatchSetting',Services.token.business_decode, reviseMatchSetting)
router.get('/detail',Services.token.business_decode, detail)



function addMatch(req, res) {
  lightco.run(function* ($) {
    try {

        var [err, transaction] = yield sequelize.transaction()
        if (err) throw err

        let opts = {
          transaction: transaction
        }

        if (req.body.formInfo)
            var formInfo = req.body.formInfo
        else
            return res.json(Conf.promise('2','无效的信息'))

        if (req.user.organization_id)
            var organizationId = req.user.organization_id
        else
            return res.json(Conf.promise('2','无效的组织ID'))


        const dailyMatchInfo = {
             dailyMatchSerie_id: formInfo.matchSerie,
             matchSetting_id: formInfo.matchSetting,
             start_time: formInfo.startTime,
             close_reg_time: formInfo.endTime,
             unit_price: formInfo.price,
             state: 0,
             style: 'hold‘em',
             remark: formInfo.remark,
        }

        for (var i = 0, j = formInfo.matchDays.length; i < j; i++ ) {
            dailyMatchInfo.match_day = formInfo.matchDays[i]
            var [err, dailyMatch] = yield DailyMatch.create(dailyMatchInfo, opts)
            if (err) throw err
        }

        transaction.commit()

        res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      if (transaction) transaction.rollback()
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

function list(req, res) {
  lightco.run(function* ($) {
    try {

        let query = []

        const myDate = new Date()
        const day = myDate.getDay()

        const Monday = getthisDay(-day + 1)
        const Weekday = getthisDay(-day + 14)

        query.push({match_day: {$gte: Monday}})
        query.push({match_day: {$lte: Weekday}})

        const opts = {
            include: [{
                model: DailyMatchSerie, attributes: ['name'],
                where: {organization_id : req.query.id}
            }],
            where: {$and: query}
        }

        var [err, list] = yield DailyMatch.scope('list').findAll(opts)
        if (err) throw err

        res.json(Conf.promise('0',list))


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

function getthisDay(day) {
    var today = new Date();
    var targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetday_milliseconds); //关键
    var tyear = today.getFullYear();
    var tMonth = today.getMonth();
    var tDate = today.getDate();
    if (tDate < 10) {
        tDate = "0" + tDate;
    }
    tMonth = tMonth + 1;
    if (tMonth < 10) {
        tMonth = "0" + tMonth;
    }
    return tyear + "-" + tMonth + "-" + tDate + "";
}





module.exports = router
