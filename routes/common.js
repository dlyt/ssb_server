'use strict'

const lightco = require('lightco')
const async = require('async')
const request = require('request')
const express = require('express')
const webcache = Services.cache.webcache
const router = express.Router()
const cache = Services.cache
const logger = log4js.getLogger('[routes-com]')

const { City,
        Country,
        Feedback,
        BigMatchTour,
        VersionManager, } = Models

router.get('/country', webcache.get, countries)
router.get('/city', webcache.get, cities)
router.get('/tour', webcache.get, tour)
router.post('/back', Services.token.decode, back)
router.get('/version', version)


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

function back(req, res) {
    lightco.run(function*($) {
        try {

            if (req.body.title)
                var title = req.body.title
            else
                return res.json(Conf.promise('6001'))

            if (req.body.content)
                var content = req.body.content
            else
                return res.json(Conf.promise('6002'))

            const user_id = req.user.user_id
            const expire = Conf.user.feedback.expire

            var [err, count] = yield cache.hget(`LOGIN_${user_id}`, 'try_count', $)
            if (err) throw err

            // /* 频繁反馈 */
            count = Utility.toInt(count)
            if (count >= 1)
                return res.json(Conf.promise('6003'))

            const new_back = {
                user_id: user_id,
                title: title,
                content: content,
            }

            var [err, back] = yield Feedback.create(new_back)
            if (err) throw err

            if (!back) {
                throw new Error(`feedback:${feedback.feedback_id} 创建feedback失败`)
            }
            else {
                var [err] = yield cache.hset(`LOGIN_${user_id}`, 'try_count', count + 1, expire, $)
                if (err) throw err
            }

            return res.json(Conf.promise('0'))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function version(req, res) {
    lightco.run(function*($) {
        try {

            const opts = {
                limit: 1,
                offset: 0,
                order: [['versionManager_id', 'DESC']],
            }

            var [err, version] = yield VersionManager.scope('info').findAll(opts)
            if (err) throw err

            return res.json(Conf.promise('0', version))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
