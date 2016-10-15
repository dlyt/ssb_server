'use strict'

const express = require('express')
const router = express.Router()
const request = require('request')
const lightco = require('lightco')
const logger = log4js.getLogger('[user-info-bind]')

const cache = Services.cache
const sms = Services.sms
const template = Conf.sms.tpl
const verify_fmt = Conf.user.password.verify_fmt
const pwd_transform = Conf.user.password.transform
const fmtId = Utility.fmtId

const { User } = Models

router.post('/getsmscode', get_smscode)
router.post('/verifysmscode', verify_smscode)
router.post('/setpassword', set_password)


function get_smscode(req, res) {
    lightco.run(function*($) {
        try {
			const mobile = req.body.mobile
	        const expire = Conf.sms.expire
	        const max = Conf.sms.max
			const user = req.user

            if (user.user) {
                const ret = fmtId(user.user, 3, 4)
                return res.json(Conf.promise('1022', ret))
			      }

            var [err, _user] = yield User.findOne({where: {'user': mobile}})
            if (err) throw err
            if (_user)
                return res.json(Conf.promise('1000'))

            if (!mobile || !Utility.checkPhone(mobile))
                return res.json(Conf.promise('1003'))

            var [err, count] = yield cache.hget(`BIND_${mobile}`, 'sms_count', $)
            if (err) throw err

            count = Utility.toInt(count)
            if (count >= max) return res.json(Conf.promise('1001'))

            const code = Utility.rand4()
            const content = template.bind(code)

            var [err, body] = yield sms.send('yzm', mobile, content, $)
			if (err) throw err

			if (body && body.code == 1 && body.result) {
				var [err] = yield cache.hset(`BIND_${mobile}`, 'sms_code', code, expire, $)
				if (err) throw err

				var [err] = yield cache.hset(`BIND_${mobile}`, 'sms_count', count + 1, $)
				if (err) throw err

				return res.json(Conf.promise('0', body.result))
			}
			res.json(Conf.promise('1002'))

        } catch (e) {
			logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}


function verify_smscode(req, res) {
    lightco.run(function*($) {
        try {
            const mobile = req.body.mobile
            const smscode = req.body.smscode
    		const expire = Conf.sms.expire
            const user = req.user

            if (user.user) {
                const ret = fmtId(user.user, 3, 4)
                return res.json(Conf.promise('1022', ret))
			}

            var [err, _user] = yield User.findOne({where: {'user': mobile}})
            if (err) throw err
            if (_user)
                return res.json(Conf.promise('1000'))

            if (!mobile || !Utility.checkPhone(mobile))
                return res.json(Conf.promise('1003'))

            if (!smscode)
                return res.json(Conf.promise('1004'))

            var [err, code] = yield cache.hget(`BIND_${mobile}`, 'sms_code', $)
			if (err) throw err

			if (code != smscode)
				return res.json(Conf.promise('1004'))

			var [err] = yield cache.hdel(`BIND_${mobile}`, 'sms_code', $)
			if (err) throw err

			const token = Utility.uuid()

			var [err] = yield cache.hset(`BIND_${mobile}`, 'token', token, expire, $)
			if (err) throw err

			res.json(Conf.promise('0', token))

        } catch (e) {
			logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}


function set_password(req, res) {
    lightco.run(function*($) {
        try {
            const mobile = req.body.mobile
            const _token = req.body.token
    		const password = req.body.password
            const user = req.user

            if (user.user) {
                const ret = fmtId(user.user, 3, 4)
                return res.json(Conf.promise('1022', ret))
			}

            var [err, _user] = yield User.findOne({where: {'user': mobile}})
            if (err) throw err
            if (_user)
                return res.json(Conf.promise('1000'))

            if (!mobile || !Utility.checkPhone(mobile))
                return res.json(Conf.promise('1003'))

            if (!_token)
                return res.json(Conf.promise('1005'))

			if (!verify_fmt(password))
				return res.json(Conf.promise('1007'))

            var [err, token] = yield cache.hget(`BIND_${mobile}`, 'token', $)
			if (err) throw err

			if (_token != token)
				return res.json(Conf.promise('1006'))

			var [err] = yield cache.hdel(`BIND_${mobile}`, 'token', $)
			if (err) throw err

            user.user = mobile
            user.password = pwd_transform(password)

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
