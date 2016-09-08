'use strict'

const lightco = require('lightco')
const async = require('async')
const request = require('request')
const express = require('express')
const router = express.Router()
const logger = log4js.getLogger('[routes-com]')

const { City,
        Country } = Models

router.get('/', function(req, res){
    res.render('index', {
        title: 'Express',
        image: 'http://ssb-oss.oss-cn-hangzhou.aliyuncs.com/casino/logo/paopao-1.png'
    });
})
router.get('/country', countrys)
router.get('/city', citys)


function countrys(req, res) {
    lightco.run(function*($) {
        try {
            if (req.query.continent)
                var continent = {continent: req.query.continent}

            const opts = {
                where : continent || {}
            }

            var [err, countrys] = yield Country.scope('intro').findAll(opts)
            if (err) throw err

            res.json(Conf.promise('0', JSON.stringify(countrys)))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function citys(req, res) {
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

            var [err, citys] = yield City.scope('intro').findAll(opts)
            if (err) throw err

            res.json(Conf.promise('0', JSON.stringify(citys)))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}



module.exports = router
