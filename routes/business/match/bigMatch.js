'use strict'

const lightco = require('lightco')
const express = require('express')
const logger = log4js.getLogger('[routes-business-bigMatch]')
const router = express.Router()
const toInt = Utility.toInt


const { Address,
        BigMatch,
        BigMatchSerie,
        BigMatchResult,
        BigMatchTour,
        Casino,
        City,
        Country,
        DailyMatchSerie,
        MatchSetting,
        Organization } = Models

router.get('/tourList', tourList)
router.post('/addTour',Services.token.business_decode, addTour)
router.post('/addResult',Services.token.business_decode, addResult)
router.post('/addBigMatch',Services.token.business_decode, addBigMatch)
router.post('/addBigMatchSerie',Services.token.business_decode, addBigMatchSerie)
router.post('/reviseMatchSetting',Services.token.business_decode, reviseMatchSetting)
router.post('/reviseMatchResult',Services.token.business_decode, reviseMatchResult)
router.get('/setInfo', setInfo)
router.get('/detail', detail)
router.get('/serieList', serieList)
router.get('/serieDetail', serieDetail)
router.get('/country', countries)
router.get('/city', cities)
router.get('/cityClub', cityClub)
router.get('/resultLists', resultLists)
router.get('/resultDetail', resultDetail)
router.get('/isPromoted', isPromoted)


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

        if (req.body.setInfo)
            var setInfo = req.body.setInfo
        else
            return res.json(Conf.promise('2','无效的信息'))

        var [err, bigMatch] = yield BigMatch.findById(setInfo.id)
        if (err) throw err

        bigMatch.can_register = setInfo.can_register
        bigMatch.isPromoted = setInfo.isPromoted
        bigMatch.state = setInfo.state
        bigMatch.matchSetting_id = setInfo.matchSetting_id
        bigMatch.haveMatchSetting = setInfo.haveMatchSetting
        bigMatch.haveMatchBonus = setInfo.haveMatchBonus
        bigMatch.haveMatchResult = setInfo.haveMatchResult

        var [err, data] = yield bigMatch.save()
        if (err) throw err

        res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function reviseMatchResult(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.body.id)
            var id = req.body.id
        else
            return res.json(Conf.promise('2'))

        if (req.body.result)
            var result = req.body.result
        else
            return res.json(Conf.promise('2'))

        if (req.body.name)
            var name = req.body.name
        else
            return res.json(Conf.promise('2'))

        const opts = {
            where: {bigMatch_id: id}
        }

        var [err, bigMatchResult] = yield BigMatchResult.findOne(opts)
        if (err) throw err

        bigMatchResult.name = name
        bigMatchResult.result = JSON.stringify(result)

        var [err, data] = yield bigMatchResult.save()
        if (err) throw err

        res.json(Conf.promise('0'))


    } catch (e) {
      console.log(e);
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

function addResult(req, res) {
  lightco.run(function* ($) {
    try {

      var transaction

      var [err, transaction] = yield sequelize.transaction()
      if (err) throw err

      let opt = {
          transaction: transaction,
      }

      if (req.body.id)
          var id = req.body.id
      else
          return res.json(Conf.promise('2'))

      if (req.body.result)
          var result = req.body.result
      else
          return res.json(Conf.promise('2'))

      const name = req.body.name

      var [err, bigMatch] = yield BigMatch.findOne({where: {bigMatch_id : id}})
      if (err) throw err

      bigMatch.haveMatchResult = 1

      var [err] = yield bigMatch.save(opt)
      if (err) throw err

      const result_opts = {
          name: name,
          result: JSON.stringify(result),
          bigMatch_id: id,
      }

      var [err, result] = yield BigMatchResult.create(result_opts, opt)
      if (err) throw err

      transaction.commit()

      res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      if (transaction) transaction.rollback()
      return res.json(Conf.promise('1'))
    }
  })
}

function addBigMatch(req, res) {
  lightco.run(function* ($) {
    try {

      var transaction

      var [err, transaction] = yield sequelize.transaction()
      if (err) throw err

      let opt = {
          transaction: transaction,
      }

      if (req.body.id)
          var id = req.body.id
      else
          return res.json(Conf.promise('2'))

      if (req.body.bigMatchInfo)
          var bigMatchInfo = req.body.bigMatchInfo
      else
          return res.json(Conf.promise('2'))

      var length = bigMatchInfo.length

      for (var i = 0;i < length; i++) {
        var data = {
            bigMatchSerie_id: id,
            matchSetting_id: bigMatchInfo[i].matchsetting_id,
            name: bigMatchInfo[i].name,
            real_buyin: bigMatchInfo[i].real_buyin,
            rake_buyin: bigMatchInfo[i].rake_buyin,
            match_day: bigMatchInfo[i].match_day,
            open_time: bigMatchInfo[i].open_time,
            close_reg_time: bigMatchInfo[i].close_reg_time,
            can_register: bigMatchInfo[i].can_register,
            unit_price: bigMatchInfo[i].unit_price,
            need_exchange: bigMatchInfo[i].need_exchange,
            exchangeRate_id: bigMatchInfo[i].exchangerate_id,
            state: bigMatchInfo[i].state,
            style: '',
            remark: bigMatchInfo[i].remark,
            isPromoted: bigMatchInfo[i].ispromoted,
            haveMatchSetting: bigMatchInfo[i].havematchsetting,
            haveMatchBonus: bigMatchInfo[i].havematchbonus,
            haveMatchResult: 0,
        }

        var [err, bigMatch] = yield BigMatch.create(data, opt)
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

function addBigMatchSerie(req, res) {
  lightco.run(function* ($) {
    try {

      if (req.body.formInfo)
          var Info = req.body.formInfo
      else
          return res.json(Conf.promise('2','无效的信息'))

      var is_tour = Info.is_tour

      const opts = {
          organization_id: Info.organization_id,
          name: Info.name,
          type: Info.type,
          is_tour: is_tour,
          tour_image: Info.tour_image,
          image_url: Info.image_url,
          intro_image_url: Info.intro_image_url,
          intro_title: Info.intro_title,
          intro_content: Info.intro_content,
          hot_level: Info.hot_level,
          need_show: Info.need_show,
          start_date: Info.start_date,
          end_date: Info.end_date,
          cooperated: Info.cooperated,
          secret_id: 1,
          is_hot: Info.is_hot,
          remark: Info.remark,
      }

      if (is_tour === '1')
          opts.bigMatchTour_id = Info.tour

      var [err, tour] = yield BigMatchSerie.create(opts)
      if (err) throw err

      res.json(Conf.promise('0'))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function setInfo(req, res) {
  lightco.run(function* ($) {
    try {

        const id = req.query.id

        const opts = {
            attributes: ['bigMatch_id', 'name', 'state', 'match_day', 'matchSetting_id', 'can_register', 'isPromoted', 'haveMatchSetting', 'haveMatchBonus', 'haveMatchResult'],
            where: {bigMatch_id: id}
        }

        const matchSetting_opt = {
            attributes: ['matchSetting_id', 'name'],
            where: {organization_id: 85}
        }

        var [err, matchSetting] = yield MatchSetting.findAll(matchSetting_opt)
        if (err) throw err

        var [err, setInfo] = yield BigMatch.findOne(opts)
        if (err) throw err

        setInfo.dataValues.matchSetting = matchSetting

        res.json(Conf.promise('0', setInfo))


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
            where: {bigMatchSerie_id: id}
        }

        var [err, detail] = yield BigMatch.findAndCountAll(opts)
        if (err) throw err

        res.json(Conf.promise('0', detail))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function serieList(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.query.id)
            var id = req.query.id
        else
            return res.json(Conf.promise('2'))

        const opts = {
            where: {organization_id: id},
            attributes: ['bigMatchSerie_id', 'name']
        }

        var [err, lists] = yield BigMatchSerie.findAndCountAll(opts)
        if (err) throw err

        lists.organization_id = id

        res.json(Conf.promise('0', lists))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function serieDetail(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.query.id)
            var id = req.query.id
        else
            return res.json(Conf.promise('2'))

        const opts = {
            include: [{
                model: BigMatch,attributes: ['bigMatch_id'],
            }],
            where: {bigMatchSerie_id: id}
        }

        var [err, detail] = yield BigMatchSerie.find(opts)
        if (err) throw err

        if (detail.dataValues.bigMatches.length === 0)
            detail.dataValues.bigMatches = 0
        else
            detail.dataValues.bigMatches = 1

        switch (detail.type) {
          case 1:
            detail.type = '国内大赛'
            break
          case 2:
            detail.type = '国际大赛'
            break
          case 3:
            detail.type = '俱乐部大赛'
            break
          default:
            detail.type = ''
        }

        detail.is_tour = 1 ? '是' : '否'

        if (!detail.tour_image)
            detail.tour_image = ''

        if (!detail.image_url)
            detail.image_url = ''

        if (!detail.intro_image_url)
            detail.intro_image_url = ''

        if (!detail.title)
            detail.title = ''

        if (!detail.content)
            detail.content = ''

        detail.need_show = 1 ? '是' : '否'
        detail.cooperated = 1 ? '是' : '否'
        detail.is_hot = 1 ? '是' : '否'

        if (!detail.remark)
            detail.remark = ''

        res.json(Conf.promise('0', detail))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function countries(req, res) {
    lightco.run(function*($) {
        try {
            if (req.query.continent)
                var continent = {continent: req.query.continent}

            const opts = {
                where : continent || {},
                attributes: ['country_id' ,'country']
            }

            var [err, countries] = yield Country.findAndCountAll(opts)
            if (err) throw err

            return res.json(Conf.promise('0',countries))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function cities(req, res) {
    lightco.run(function*($) {
        try {
            if (req.query.country_id)
                var country = {country_id: req.query.country_id}

            const opts = {
                where: country || {},
                attributes: ['city_id', 'city']
            }

            var [err, cities] = yield City.findAndCountAll(opts)
            if (err) throw err

            return res.json(Conf.promise('0',cities))



        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function cityClub(req, res) {
    lightco.run(function*($) {
        try {

            if (req.query.city_id)
                var city = {city_id: req.query.city_id}

            const opts = {
                include: [{
                    model: Casino, attributes: ['casino_id'],
                    include: [{
                        model: Address, attributes: ['address_id'],
                        include: [{
                            model: City, attributes: ['city_id'],
                            where: city || {},
                        }]
                    }]
                }],
                attributes: ['organization_id', 'name']
            }

            var [err, organization] = yield Organization.findAndCountAll(opts)
            if (err) throw err

            return res.json(Conf.promise('0',organization))


        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function resultLists(req, res) {
  lightco.run(function* ($) {
    try {
        const id = req.query.id

        const opts = {
            include: [{
                model: BigMatchResult, attributes: ['bigMatchResult_id']
            }],
            attributes: ['bigMatch_id', 'name', 'match_day'],
            where: {bigMatchSerie_id: id}
        }

        var [err, lists] = yield BigMatch.findAndCountAll(opts)
        if (err) throw err

        res.json(Conf.promise('0', lists))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function resultDetail(req, res) {
  lightco.run(function* ($) {
    try {
        const id = req.query.id

        const opts = {
            attributes: ['name', 'result'],
            where: {bigMatch_id: id}
        }

        var [err, detail] = yield BigMatchResult.findOne(opts)
        if (err) throw err

        res.json(Conf.promise('0', detail))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}

function isPromoted(req, res) {
  lightco.run(function* ($) {
    try {
        const id = req.query.id

        const opts = {
            attributes: ['isPromoted'],
            where: {bigMatch_id: id}
        }

        var [err, data] = yield BigMatch.findOne(opts)
        if (err) throw err

        res.json(Conf.promise('0', data))


    } catch (e) {
      logger.warn(e)
      return res.json(Conf.promise('1'))
    }
  })
}


module.exports = router
