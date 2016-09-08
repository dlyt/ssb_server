'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()
const logger = log4js.getLogger('[user]')
const pwd_transform = Conf.user.password.transform

const {User} = Models

router.get('/', Services.token.decode, verify_token)
router.use('/login', login)
router.use('/logout', Services.token.decode, logout)
router.use('/info', Services.token.decode, require('./info'))
router.use('/vip', Services.token.decode, require('./vip'))
router.use('/register', require('./register'))
router.use('/retrieve', require('./retrieve'))
router.use('/thirdparty', require('./thirdparty'))



function verify_token(req, res) {
    res.json(Conf.promise('0', 'OK'))
}

function login(req, res) {
    lightco.run(function*($) {
        try {
            const mobile = req.body.mobile
            const password = req.body.password

            if (!mobile || !password)
                return res.json(Conf.promise('1011'))

            var [err, user] = yield User.findOne({where: {'user': mobile}})
            if (err) throw err
            if (!user) return res.json(Conf.promise('1008'))

            const md5 = pwd_transform(password)

            if (md5 != user.password)
                return res.json(Conf.promise('1011'))

            var [err, jwt] = yield Services.token.encode(user, $)
			if (err) throw err

			return res.json(Conf.promise('0', jwt))

        } catch (e) {
			logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}

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
