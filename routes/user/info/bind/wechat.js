'use strict'

const express = require('express')
const router = express.Router()
const lightco = require('lightco')
const logger = log4js.getLogger('[user-info-bind]')
const wechat = Services.wechat
const fmtId = Utility.fmtId

const { User } = Models

router.post('/', bind)


function bind(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user
            const code = req.body.code
            console.log(req.body);
            if (user.wechat_unionid)
                return res.json(Conf.promise('1023'))

            var [err, value] = yield wechat.auth.authorize(code, $)
            if (err) throw err

            if (value.errmsg)
                return res.json(Conf.promise('1021', value.errmsg))

            if (!value.unionid)
                return res.json(Conf.promise('1021'))

            let unionid = value.unionid

            let opts = {
                where: {wechat_unionid: unionid}
            }

            var [err, _user] = yield User.findOne(opts)
            if (err) throw err

            if (_user) {
                const ret = fmtId(_user.user, 3, 4)
                return res.json(Conf.promise('1024', ret))
            }

            user.wechat_unionid = unionid

            var [err] = yield user.save()
            if (err) throw err

            return res.json(Conf.promise('0'))

        } catch (e) {
			logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router;
