'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()
const logger = log4js.getLogger('[routes-user]')
const cache = Services.cache
const pwd_transform = Conf.user.password.transform

const {User} = Models

router.get('/', Services.token.decode, verify_token)
router.post('/login', login)
router.post('/logout', Services.token.decode, logout)
router.use('/info', Services.token.decode, require('./info'))       /* 用户信息 */
router.use('/vip', Services.token.decode, require('./vip'))
router.use('/register', require('./register'))      /* 注册 */
router.use('/retrieve', require('./retrieve'))      /* 找回密码 */
router.use('/thirdparty', require('./thirdparty'))  /* 第三方功能(登陆等) */


/* 验证token 是否有效 */
function verify_token(req, res) {
    res.json(Conf.promise('0', 'OK'))
}

/* 用户登陆 */
function login(req, res) {
    lightco.run(function*($) {
        try {
            const mobile = req.body.mobile
            const password = req.body.password

            const expire = Conf.user.try.expire
	        const max = Conf.user.try.max

            if (!mobile || !password)
                return res.json(Conf.promise('1011'))

            var [err, count] = yield cache.hget(`LOGIN_${mobile}`, 'try_count', $)
            if (err) throw err

            /* 频繁错误登陆 */
            count = Utility.toInt(count)
            if (count >= max)
                return res.json(Conf.promise('1025'))

            var [err, user] = yield User.findOne({where: {'user': mobile}})
            if (err) throw err
            if (!user)
                return res.json(Conf.promise('1008'))

            const md5 = pwd_transform(password)

            /* 密码错误 */
            if (md5 != user.password) {
                var [err] = yield cache.hset(`LOGIN_${mobile}`, 'try_count', count + 1, expire, $)
				if (err) throw err

                return res.json(Conf.promise('1011'))
            }

            /* 生成token */
            var [err, jwt] = yield Services.token.encode(user, $)
			if (err) throw err

			return res.json(Conf.promise('0', jwt))

        } catch (e) {
			logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}

/* 用户登出 */
function logout(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user
            var [err] = yield Services.token.del(user, $)
			if (err) throw err

			return res.json(Conf.promise('0'))

        } catch (e) {
			logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
