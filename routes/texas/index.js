'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()
const toInt = Utility.toInt
const webcache = Services.cache.webcache
const logger = log4js.getLogger('[routes-matchSetting]')

router.use('/big', require('./big'))
router.use('/daily', require('./daily'))
router.get('/setting/:id', webcache.get, match_setting)

const { MatchSetting } = Models

function match_setting(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            var [err, setting] = yield MatchSetting.scope('detail').findById(id)
            if (err) throw err

            setting.structure = {
                "blindTime": setting.dataValues.blindTime,
                "chip": setting.dataValues.chip,
                "items": JSON.parse(setting.dataValues.setting),
                "bonuses": JSON.parse(setting.dataValues.bonuses),
                "remark": setting.dataValues.remark,
              }

              const data = {
                  structure: JSON.stringify(setting.structure),
                  remark: setting.remark,
              }

            if (setting == null) {
                res.json(Conf.promise('3'))
            } else {
                let pack = Conf.promise('0', data)

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
