'use strict'

const express = require('express')
const router = express.Router()
const lightco = require('lightco')
const logger = log4js.getLogger('[user-info]')
const fmtId = Utility.fmtId

const { User } = Models

router.get('/', info)
router.use('/supplement', require('./supplement'))
router.use('/bind', require('./bind'))


function info(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user
            const result = {
                rickName: user.rickName,
                userPoint: user.userPoint,
                realName: user.realName,
                mobile: fmtId(user.mobile, 3, 4),
                idCard: fmtId(user.idCard, 3, 4),
                passportID: fmtId(user.passportID, 3, 4),
                oneWayPermit: fmtId(user.oneWayPermit, 3, 4)
            }

            return res.json(Conf.promise('0', result))

        } catch (e) {
            logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
