'use strict'

const lightco = require('lightco')
const async = require('async')
const request = require('request')
const express = require('express')
const webcache = Services.cache.webcache
const router = express.Router()
const logger = log4js.getLogger('[routes-casino]')
const toInt = Utility.toInt

const { Country,
        City,
        Address,
        Casino,
        Organization,
        CasinoFeature,
        Feature,
        CasinoImage,
        BigMatchSerie,
        DailyMatchSerie } = Models

router.get('/', webcache.get, casinos)
router.get('/:id', webcache.get, casino)
router.get('/bigmatch/:id', webcache.get, casino_big_match)
router.get('/dailymatch/:id', webcache.get, casino_daily_match)

function casinos(req, res) {
    lightco.run(function*($) {
        try {
            const def = Conf.const.com.casion.limit_def
            const max = Conf.const.com.casion.limit_max

            if (req.query.city)
                var city_where = {'city': req.query.city}

            if (req.query.country)
                var country_where = {'country': req.query.country}

            const opts = {
                distinct: true,
                include: [
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
                    },{
                        model: Feature,
                        attributes: ['feature'],
                        through: {attributes: []}
                    },{
                        model: CasinoImage,
                        attributes: ['url']
                    }
                ],
                order: [['last_update', req.query.order || 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def),
                where: { isTempClub : 0 }
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, casinos] = yield Casino.scope('detail').findAndCountAll(opts)
            if (err) throw err

            if (casinos.count === 0) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', casinos)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }



        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function casino(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            const opts = {
                include: [
                    {
                        model: Address,
                        attributes: ['address', 'longitude', 'latitude'],
                        include: [{
                            model: City,
                            attributes: ['city'],
                            include: [{
                                model: Country,
                                attributes: ['country', 'continent']
                            }]
                        }]
                    },{
                        model: Feature,
                        attributes: ['feature'],
                        through: {attributes: []}
                    },{
                        model: CasinoImage,
                        attributes: ['url']
                    }
                ]
            }

            var [err, casino] = yield Casino.scope('detail').findById(id, opts)
            if (err) throw err

            if (casinos.value == null) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', casino)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function casino_big_match(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            const def = Conf.const.com.casion.limit_def
            const max = Conf.const.com.casion.limit_max

            const opts = {
                distinct: true,
                include: [{
                    model: Organization, required: true,
                    attributes: [],
                    include: [{
                        model: Casino, required: true,
                        attributes: [],
                        where: {casino_id: id}
                    }]
                }],
                order: [['last_update', req.query.order || 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def)
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, matchs] = yield BigMatchSerie.scope('show', 'intro').findAndCountAll(opts)
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

function casino_daily_match(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            const def = Conf.const.com.casion.limit_def
            const max = Conf.const.com.casion.limit_max

            const opts = {
                distinct: true,
                include: [{
                    model: Organization, required: true,
                    attributes: [],
                    include: [{
                        model: Casino, required: true,
                        attributes: [],
                        where: {casino_id: id}
                    }]
                }],
                order: [['last_update', req.query.order || 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def)
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, matchs] = yield DailyMatchSerie.scope('show', 'intro').findAndCountAll(opts)
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

module.exports = router
