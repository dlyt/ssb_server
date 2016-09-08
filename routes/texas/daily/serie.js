'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()
const logger = log4js.getLogger('[routes-daily-serie]')
const toInt = Utility.toInt

router.get('/', series)
router.get('/hot', hot)
router.get('/:id', serie)
router.get('/detail/:id', serie_detail)
router.get('/match/:id', serie_match)

const { User,
        DailyMatchSerie,
        DailyMatch,
        Organization,
        Casino,
        Address,
        City,
        Country } = Models

function series(req, res) {
    lightco.run(function*($) {
        try {
            const def = Conf.const.daily.serie.limit_def
            const max = Conf.const.daily.serie.limit_max

            const opts = {
                order: [['last_update', req.query.order || 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def)
            }
            opts.limit = opts.limit > max ? max : opts.limit

            var [err, series] = yield DailyMatchSerie.scope('show', 'intro').findAndCountAll(opts)
            if (err) throw err

            res.json(Conf.promise('0', series))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function hot(req, res) {
    lightco.run(function*($) {
        try {
            if (req.query.city)
                var city_where = {'city': req.query.city}

            if (req.query.country)
                var country_where = {'country': req.query.country}

            if (req.query.day)
                var day_where = {'match_day': new Date()}

            const opts = {
                attributes: ['casino_id', 'casino', 'logo_url', 'last_update'],
                distinct: true,
                include: [
                    {
                        model: Organization, required: true,
                        attributes: ['organization_id', 'name'],
                        include: [{
                            model: DailyMatchSerie, required: true,
                            attributes: ['dailyMatchSerie_id', 'name', 'hot_level'],
                            where: {need_show: 1},
                            include: [{
                                model: DailyMatch, required: true,
                                attributes: {exclude: ['last_update']},
                                where: day_where || {}
                            }]
                        }]
                    },
                    {
                        model: Address, required: true,
                        attributes: ['address', 'longitude', 'latitude'],
                        include: [{
                            model: City, required: true,
                            attributes: [],
                            where: city_where || {},
                            include: [{
                                model: Country, required: true,
                                attributes: [],
                                where: country_where || {}
                            }]
                        }]
                    }
                ],
                order: [['last_update', req.query.order || 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, 5)
            }

            var [err, casinos] = yield Casino.findAndCountAll(opts)
            if (err) throw err
            res.json(Conf.promise('0', casinos))

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

            var [err, serie] = yield DailyMatchSerie.scope('show', 'detail').findById(id)
            if (err) throw err

            res.json(Conf.promise('0', serie))

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
                        attributes: {exclude: ['last_update', 'contact_phone', 'contact_person', 'intorduction']},
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

            var [err, serie] = yield DailyMatchSerie.scope('show', 'detail').findById(id, opts)
            if (err) throw err

            res.json(Conf.promise('0', serie))

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

            const def = Conf.const.daily.serie.limit_def
            const max = Conf.const.daily.serie.limit_max

            const opts = {
                where : {'dailyMatchSerie_id': id},
                order: [['last_update', req.query.order || 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def)
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, matchs] = yield DailyMatch.scope('intro').findAndCountAll(opts)
            if (err) throw err

            res.json(Conf.promise('0', matchs))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
