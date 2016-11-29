'use strict'

const lightco = require('lightco')
const express = require('express')
const moment = require('moment')
const Sequelize = require('sequelize')
const router = express.Router()
const logger = log4js.getLogger('[routes-big-serie]')
const toInt = Utility.toInt
const dateFormat = Utility.dateFormat
const webcache = Services.cache.webcache

router.get('/', webcache.get, series)
router.get('/hot', webcache.get, hot)
router.get('/today', webcache.get, today)
router.get('/:id', webcache.get, serie)
router.get('/show/:id', webcache.get, show)
router.get('/detail/:id', webcache.get, serie_detail)
router.get('/match/:id', webcache.get, serie_match)
router.get('/join/:id', webcache.get, serie_match)
router.get('/map/:id', webcache.get, serie_map)

const { User,
        ExchangeRate,
        BigMatchSerie,
        BigMatchSerieShare,
        BigMatch,
        BigMatchTour,
        Organization,
        Casino,
        Address,
        City,
        Country } = Models

function series(req, res) {
    lightco.run(function*($) {
        try {
            const S = Sequelize

            const def = Conf.const.big.serie.limit_def
            const max = 15

            let query = []

            /* 按月查询 */
            if (req.query.month) {
                const m = req.query.month
                const length = m.length
                if (length === 4) {
                  query.push(S.where(S.fn('PERIOD_DIFF',S.fn('DATE_FORMAT',S.col('start_date'),'%Y'),m),'=',0))
                }
                if (length === 6) {
                  query.push(S.where(S.fn('PERIOD_DIFF',S.fn('DATE_FORMAT',S.col('start_date'),'%Y%m'),m),'<=',0))
                  query.push(S.where(S.fn('PERIOD_DIFF',S.fn('DATE_FORMAT',S.col('end_date'),'%Y%m'),m),'>=',0))
                }
            }

            /* 按天查询 */
            if (req.query.day) {
                const d = req.query.day
                query.push({start_date: {$lte: d}})
                query.push({end_date: {$gte: d}})
            }

            /* type */
            if (req.query.type)
                query.push({type: toInt(req.query.type)})

            /* 国家 */
            if (req.query.country)
                var country = {country: req.query.country}

            /* 城市 */
            if (req.query.city)
                var city = {city: req.query.city}

            const include = [{
                model: Organization, attributes: ['name'],
                include: [{
                    model: Casino, attributes: ['casino', 'contact_phone', 'web_url'],
                    include: [{
                        model: Address, attributes: ['address'],
                        include: [{
                            model: City, attributes: ['city', 'city_en'],
                            where: city || {},
                            include: [{
                                model: Country, attributes: ['country', 'continent', 'image_url'],
                                where: country || {}
                            }]
                        }]
                    }]
                }]
            }]

            /* 巡回赛查询 */
            if (req.query.tour) {
              var tour = {bigMatchTour_id: req.query.tour}
              include.push({
                model: BigMatchTour, attributes: ['name'],
                where: tour || {}
              })
            }

            let opts = {
                include: include,
                order: [['start_date', req.query.order || 'ASC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def),
                where: {$and: query}
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, series] = yield BigMatchSerie.scope('show', 'detail').findAndCountAll(opts)
            if (err) throw err

            if (series.count === 0) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', series)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }



        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function hot(req, res) {
    lightco.run(function*($) {
        try {
            const S = Sequelize

            const def = Conf.const.big.serie.limit_def
            const max = Conf.const.big.serie.limit_max
            const timeline = new Date(moment().subtract(3, 'days'))

            let opts = {
                include: [{
                    model: Organization,
                    attributes: {exclude: ['last_update']},
                    include: [{
                        model: Casino,
                        attributes: {exclude: ['contact_phone', 'contact_person', 'last_update', 'intorduction']},
                        include: [{
                            model: Address,
                            attributes: {exclude: ['last_update']},
                            include: [{
                                model: City,
                                attributes: {exclude: ['last_update']},
                                include: [{
                                    model: Country,
                                    attributes: {exclude: ['last_update']}
                                }]
                            }]
                        }]
                    }]
                }],
                order: [['hot_level', 'ASC'], ['start_date', 'ASC'] ],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def),
                where: {
                    is_hot: 1,
                    end_date: {$gte: timeline}
                }
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, series] = yield BigMatchSerie.scope('show', 'detail').findAndCountAll(opts)
            if (err) throw err

            if (series.count === 0) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', series)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }



        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function today(req, res) {
    lightco.run(function*($) {
        try {
            const S = Sequelize

            const def = Conf.const.big.serie.limit_def
            const max = 15

            /* 按天查询 */
            if (req.query.match_day) {
                const match_day = req.query.match_day
                var matchDay = {match_day: match_day}
            }


            /* 俱乐部 */
            if (req.query.casino_id)
                var casinoId = {casino_id: req.query.casino_id}

            const include = [{
                model: BigMatchSerie, attributes: [],
                include: [{
                    model: Organization, attributes: [],
                    include: [{
                        model: Casino, attributes: [],
                        where: casinoId || {},
                    }]
                }]
            },{
                model: ExchangeRate,
            }]

            let opts = {
                include: include,
                order: [['open_time', req.query.order || 'ASC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def),
                where: matchDay || {},
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, bigmatch] = yield BigMatch.findAndCountAll(opts)
            if (err) throw err

            if (bigmatch.count === 0) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', bigmatch)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }


        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}


function serie(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            var [err, serie] = yield BigMatchSerie.scope('show', 'detail').findById(id)
            if (err) throw err

            if (serie === null) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', serie)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function show(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            const opts = {
                include: [{
                    model: BigMatchSerieShare, attributes: {exclude: ['bigMatchSerie_id', 'last_update']}
                },{
                    model: Organization, attributes: ['organization_id'],
                    include: [{
                        model: Casino, attributes: ['address_id'],
                        include: [{
                            model: Address, attributes: ['address']
                        }]
                    }]
                }],
                where: {bigMatchSerie_id : id},
                attributes: {
                    exclude: ['image_url', 'intro_content', 'intro_image_url']
                }
            }

            var [err, serie] = yield BigMatchSerie.scope('show', 'detail').findOne(opts)
            if (err) throw err

            serie.dataValues.share = 'https://ht.91buyin.com/share/'

            if (serie === null) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', serie)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function serie_detail(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            const opts = {
                include: [{
                    model: Organization,
                    attributes: {exclude: ['last_update']},
                    include: [{
                        model: Casino,
                        attributes: {exclude: ['contact_phone', 'contact_person', 'last_update', 'intorduction']},
                        include: [{
                            model: Address,
                            attributes: {exclude: ['last_update']},
                            include: [{
                                model: City,
                                attributes: {exclude: ['last_update']},
                                include: [{
                                    model: Country,
                                    attributes: {exclude: ['last_update']}
                                }]
                            }]
                        }]
                    }]
                }]
            }

            var [err, serie] = yield BigMatchSerie.scope('show', 'detail').findById(id, opts)
            if (err) throw err

            if (serie === null) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', serie)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }



        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function serie_match(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            const def = Conf.const.big.serie.limit_def
            const max = Conf.const.big.serie.limit_max

            const opts = {
                include: [{
                    model: ExchangeRate,
                    attributes: ['exchangeRate_id', 'currency_name', 'exchange_rate', 'currency_code']
                }],
                order: [['match_day', 'ASC'], ['open_time','ASC']],
                where : {'bigMatchSerie_id': id},
                offset: toInt(req.query.offset, 0),
                //limit: toInt(req.query.limit, def)
            }

            //opts.limit = opts.limit > max ? max : opts.limit

            var [err, matchs] = yield BigMatch.scope('intro').findAndCountAll(opts)
            if (err) throw err

            if (matchs.count === 0) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', matchs)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function filter(matchs) {
    var record = {}
    for (var match of matchs) {
        var day = match.day
        if (!record[day])
            record[day] = []
        record[day].push(match.id)
    }
    return record
}

function serie_map(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)
            const S = Sequelize

            const def = Conf.const.big.serie.limit_def
            const max = Conf.const.big.serie.limit_max

            const opts = {
                order: [['match_day', 'ASC']],
                attributes: [['bigMatch_id', 'id'],
                            [S.fn('DATE_FORMAT',S.col('match_day'),'%Y%m%d'), 'day']],
                where : {'bigMatchSerie_id': id},
                raw: true
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, matchs] = yield BigMatch.findAll(opts)
            if (err) throw err

            if (matchs.length === 0) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', filter(matchs))

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
