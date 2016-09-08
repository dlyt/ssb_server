'use strict'

const express = require('express')
const router = express.Router()
const lightco = require('lightco')
const logger = log4js.getLogger('[user-register]')
const wechat = Services.wechat
const fmtId = Utility.fmtId

const { User } = Models

router.post('/', bind)


function bind(req, res) {
    lightco.run(function*($) {
        var transaction
        try {
			var [err, transaction] = yield sequelize.transaction()
            if (err) throw err

            const user = req.user
            const code = req.body.code

            if (user.wechat_unionid) {
                transaction.commit()
                return res.json(Conf.promise('1023'))
            }

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

            var [err, _user] = yield User.findOne(opts)
            if (err) throw err

            if (_user) {
                transaction.commit()
                const ret = fmtId(_user.user, 3, 4)
                return res.json(Conf.promise('1024', ret))
            }

            user.wechat_unionid = unionid

            opts = {transaction: transaction}

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

module.exports = router;
