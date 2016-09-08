'use strict'

const lightco = require('lightco')
const express = require('express')
const Sequelize = require('sequelize')
const router = express.Router()
const logger = log4js.getLogger('[routes-big-serie]')
const toInt = Utility.toInt
const dateFormat = Utility.dateFormat

router.get('/', series)
router.get('/hot', hot)
router.get('/:id', serie)
router.get('/detail/:id', serie_detail)
router.get('/match/:id', serie_match)
router.get('/join/:id', serie_match)
router.get('/map/:id', serie_map)
/* 临时 */
// router.get('/temp1/:id', serie_temp1)
// router.get('/temp2/:id', serie_temp2)

const { User,
        BigMatchSerie,
        BigMatch,
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
            const max = Conf.const.big.serie.limit_max

            let query = []

            /* 按月查询 */
            if (req.query.month) {
                const m = req.query.month
                query.push(S.where(S.fn('PERIOD_DIFF',S.fn('DATE_FORMAT',S.col('start_date'),'%Y%m'),m),'<=',0))
                query.push(S.where(S.fn('PERIOD_DIFF',S.fn('DATE_FORMAT',S.col('end_date'),'%Y%m'),m),'>=',0))
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
                    model: Casino, attributes: ['casino'],
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

            let opts = {
                include: include,
                order: [['last_update', req.query.order || 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def),
                where: {$and: query}
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, series] = yield BigMatchSerie.scope('show', 'detail').findAndCountAll(opts)
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
            const S = Sequelize

            const def = Conf.const.big.serie.limit_def
            const max = Conf.const.big.serie.limit_max

            let opts = {
                order: [['start_date', 'ASC'] , ['hot_level', 'ASC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def),
                where: {
                    cooperated: 1,
                    end_date: {$gte: new Date()}
                }
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, series] = yield BigMatchSerie.scope('show', 'detail').findAndCountAll(opts)
            if (err) throw err

            res.json(Conf.promise('0', series))

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

            const def = Conf.const.big.serie.limit_def
            const max = Conf.const.big.serie.limit_max

            const opts = {
                order: [['last_update', req.query.order || 'DESC']],
                where : {'bigMatchSerie_id': id},
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def)
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, matchs] = yield BigMatch.scope('intro').findAndCountAll(opts)
            if (err) throw err

            res.json(Conf.promise('0', matchs))

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

            res.json(Conf.promise('0', filter(matchs)))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
