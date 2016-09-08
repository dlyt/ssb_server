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
        var transaction
        try {
			var [err, transaction] = yield sequelize.transaction()
            if (err) throw err

            const opts = {transaction: transaction}

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
                if (user.realName) {
                    transaction.commit()
                    return res.json(Conf.promise('1012'))
                }
                if (Utility.checkName(realName) === false) {
                    transaction.commit()
                    return res.json(Conf.promise('1017'))
                }
                save = true
                user.realName = realName
            }

            if (idCard) {
                if (user.idCard) {
                    transaction.commit()
                    return res.json(Conf.promise('1013'))
                }
                if (Utility.checkIdCard(idCard) === false) {
                    transaction.commit()
                    return res.json(Conf.promise('1014'))
                }
                save = true
                user.idCard = idCard
            }

            if (passportID) {
                if (user.passportID) {
                    transaction.commit()
                    return res.json(Conf.promise('1016'))
                }
                if (Utility.checkPassportID(passportID) === false) {
                    transaction.commit()
                    return res.json(Conf.promise('1018'))
                }
                save = true
                user.passportID = passportID
            }

            if (oneWayPermit) {
                if (user.oneWayPermit) {
                    transaction.commit()
                    return res.json(Conf.promise('1015'))
                }
                if (Utility.checkOneWayPermit(oneWayPermit) === false) {
                    transaction.commit()
                    return res.json(Conf.promise('1019'))
                }
                save = true
                user.oneWayPermit = oneWayPermit
            }

            if (!save) {
                transaction.commit()
                return res.json(Conf.promise('1020'))
            }

            var [err] = yield user.save(opts)
            if (err) throw err

			transaction.commit()

            return res.json(Conf.promise('0'))

        } catch (e) {
            logger.warn(e)
            if (transaction) transaction.rollback()
            return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
