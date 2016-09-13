'use strict'

const express = require('express')
const router = express.Router()
const assert = require('assert')
const lightco = require('lightco')
const logger = log4js.getLogger('[user-info]')
const checkIdCard = Utility.checkIdCard

const { User } = Models

router.post('/', supplement)

function supplement(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user
            const rickName = req.body.rickName
            const realName = req.body.realName
            const idCard = req.body.idCard
            const passportID = req.body.passportID
            const oneWayPermit = req.body.oneWayPermit
            let save = false

            if (rickName) {
                save = true
                user.rickName = rickName
            }

            if (realName) {
                if (user.realName)
                    return res.json(Conf.promise('1012'))

                if (Utility.checkName(realName) === false)
                    return res.json(Conf.promise('1017'))

                save = true
                user.realName = realName
            }

            if (idCard) {
                if (user.idCard)
                    return res.json(Conf.promise('1013'))

                if (Utility.checkIdCard(idCard) === false)
                    return res.json(Conf.promise('1014'))

                save = true
                user.idCard = idCard
            }

            if (passportID) {
                if (user.passportID)
                    return res.json(Conf.promise('1016'))

                if (Utility.checkPassportID(passportID) === false)
                    return res.json(Conf.promise('1018'))

                save = true
                user.passportID = passportID
            }

            if (oneWayPermit) {
                if (user.oneWayPermit)
                    return res.json(Conf.promise('1015'))

                if (Utility.checkOneWayPermit(oneWayPermit) === false)
                    return res.json(Conf.promise('1019'))

                save = true
                user.oneWayPermit = oneWayPermit
            }

            if (!save)
                return res.json(Conf.promise('1020'))

            var [err] = yield user.save(opts)
            if (err) throw err

            return res.json(Conf.promise('0'))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
