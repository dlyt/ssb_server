'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()
const logger = log4js.getLogger('[routes-big-tour]')
const toInt = Utility.toInt

router.get('/', tours)
router.get('/:id', tour_detail)
router.get('/serie/:id', tour_serie)

const {User, BigMatchTour, BigMatchSerie} = Models

function tours(req, res) {
    lightco.run(function*($) {
        try {
            const def = Conf.const.big.tour.limit_def
            const max = Conf.const.big.tour.limit_max

            const opts = {
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def)
            }
            opts.limit = opts.limit > max ? max : opts.limit

            var [err, tours] = yield BigMatchTour.scope('intro').findAndCountAll(opts)
            if (err) throw err

            res.json(Conf.promise('0', tours))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function tour_detail(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            var [err, tour] = yield BigMatchTour.scope('detail').findById(id)
            if (err) throw err

            res.json(Conf.promise('0', tour))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function tour_serie(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            var [err, tour] = yield BigMatchTour.findById(id)
            if (err) throw err
            if (!tour)
                return res.json(Conf.promise('3001'))

            const opts = {
                where : {'bigMatchTour_id': tour.bigMatchTour_id}
            }

            var [err, series] = yield BigMatchSerie.scope('show', 'detail').findAll(opts)
            if (err) throw err

            res.json(Conf.promise('0', series))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
