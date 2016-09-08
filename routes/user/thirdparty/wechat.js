'use strict'

const express = require('express')
const router = express.Router()
const lightco = require('lightco')
const logger = log4js.getLogger('[user-register]')
const wechat = Services.wechat

const { User } = Models

router.use('/login', login)


function login(req, res) {
    lightco.run(function*($) {
        var transaction
        try {
			var [err, transaction] = yield sequelize.transaction()
            if (err) throw err

            const code = req.body.code

            var [err, value] = yield wechat.auth.authorize(code, $)
            if (err) throw err

            if (value.errmsg) {
                transaction.commit()
                return res.json(Conf.promise('1021', value.errmsg))
            }

            if (!value.unionid) {
                transaction.commit()
                return res.json(Conf.promise('1021'))
            }

            let unionid = value.unionid

            let opts = {
                where: {wechat_unionid: unionid},
                transaction: transaction
            }

            var [err, user] = yield User.findOne(opts)
            if (err) throw err

            let created = false

            if (!user) {
                const new_user = {
                    wechat_unionid: unionid
                }
                const opts = {
                    transaction: transaction
                }
                var [err, _user] = yield User.create(new_user, opts)
                if (err) throw err

                created = true
                user = _user
            }

            var [err, jwt] = yield Services.token.encode(user, $)
            if (err) throw err

            const ret = {
                created: created,
                token: jwt
            }

            transaction.commit()

            return res.json(Conf.promise('0', ret))

        } catch (e) {
			logger.warn(e)
            if (transaction) transaction.rollback()
			return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router;
