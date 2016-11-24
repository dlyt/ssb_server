'use strict'

const lightco = require('lightco')
const express = require('express')
const logger = log4js.getLogger('[routes-business-bigMatch]')
const router = express.Router()
const toInt = Utility.toInt


const { Address,
        BigMatchSerie,
        BigMatchTour,
        Casino,
        City,
        Country,
        DailyMatchSerie,
        MatchSetting,
        Organization } = Models

router.get('/tourList', tourList)                //巡回赛列表
router.post('/addTour',Services.token.business_decode, addTour)
router.post('/addBigMatchSerie',Services.token.business_decode, addBigMatchSerie)
//router.post('/reviseMatchSetting',Services.token.business_decode, reviseMatchSetting)
router.get('/detail', detail)
router.get('/serieList', serieList)
router.get('/serieDetail', serieDetail)
router.get('/country', countries)
router.get('/city', cities)
router.get('/cityClub', cityClub)


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

function detail(req, res) {
  lightco.run(function* ($) {
    try {

        const id = req.params.id

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

        var [err, detail] = yield BigMatchSerie.findById(id)
        if (err) throw err

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


module.exports = router
