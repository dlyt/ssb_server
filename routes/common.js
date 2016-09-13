'use strict'

const lightco = require('lightco')
const async = require('async')
const request = require('request')
const express = require('express')
const webcache = Services.cache.webcache
const router = express.Router()
const logger = log4js.getLogger('[routes-com]')

const { City,
        Country } = Models

router.get('/country', webcache.get, countries)
router.get('/city', webcache.get, cities)

function countries(req, res) {
    lightco.run(function*($) {
        try {
            if (req.query.continent)
                var continent = {continent: req.query.continent}

            const opts = {
                where : continent || {}
            }

            var [err, countries] = yield Country.scope('intro').findAll(opts)
            if (err) throw err

            let pack = Conf.promise('0', countries)

            yield webcache.set(req, JSON.stringify(pack), $)

            res.json(pack)

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function cities(req, res) {
    lightco.run(function*($) {
        try {
            if (req.query.country)
                var country = {country: req.query.country}

            const opts = {
                include: [{
                    model: Country, attributes: [],
                    where: country || {}
                }]
            }

            var [err, cities] = yield City.scope('intro').findAll(opts)
            if (err) throw err

            let pack = Conf.promise('0', cities)

            yield webcache.set(req, JSON.stringify(pack), $)

            res.json(pack)

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}



module.exports = router
