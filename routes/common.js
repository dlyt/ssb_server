'use strict'

const lightco = require('lightco')
const async = require('async')
const request = require('request')
const express = require('express')
const webcache = Services.cache.webcache
const router = express.Router()
const logger = log4js.getLogger('[routes-com]')

const { City,
        Country,
        BigMatchTour } = Models

router.get('/country', webcache.get, countries)
router.get('/city', webcache.get, cities)
router.get('/tour', webcache.get, tour)


function countries(req, res) {
    lightco.run(function*($) {
        try {
            if (req.query.continent)
                var continent = {continent: req.query.continent}

            const opts = {
                where : continent || {}
            }

            var [err, countries] = yield Country.scope('intro').findAndCountAll(opts)
            if (err) throw err

            if (countries.count === 0) {
                  return res.json(Conf.promise('3'))

            } else {
                  let pack = Conf.promise('0', countries)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }



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

            var [err, cities] = yield City.scope('intro').findAndCountAll(opts)
            if (err) throw err

            if (cities.count === 0) {
                  return res.json(Conf.promise('3'))

            } else {
                  let pack = Conf.promise('0', cities)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }



        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function tour(req, res) {
    lightco.run(function*($) {
        try {
            if (req.query.tourName)
                var tourName = {name: req.query.tourName}

            const opts = {
                where : tourName || {}
            }

            var [err, bigMatchTour] = yield BigMatchTour.findAndCountAll(opts)
            if (err) throw err

            if (bigMatchTour.count === 0) {
                  return res.json(Conf.promise('3'))

            } else {
                  let pack = Conf.promise('0', bigMatchTour)

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
