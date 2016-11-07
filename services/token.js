'use strict'

const lightco = require('lightco')
const jwt = require('jsonwebtoken')
const cache = require('./cache')
const logger = log4js.getLogger('[services-token]')

const secret = Conf.user.jwt.secret
const expire = Conf.user.jwt.expire

const {User, Business} = Models

let token = {}

/* 创建 hash 池 用于存储 token */
cache.hset('jsonwebtoken', '', '')

/* 生成 token */
token.encode = function(user, cb) {
    lightco.run(function*($) {
        try {
            if (!user)
                return cb(new Error('无效的user!'))

            if (user.user_id)
                var id = user.user_id.toString()

            if (user.business_id)
                var id = user.business_id.toString()

            const token = jwt.sign({id: id}, secret, {expiresIn: expire})
            var [err] = yield cache.hset('jsonwebtoken', id, token, $)
            if (err) throw err

			      if (cb) cb(null, token)

        } catch (e) {
      			logger.warn(e)
      			if (cb) cb(e)
        }
    })
}

/* 删除 token */
token.del = function(user, cb) {
    lightco.run(function*($) {
        try {
            if (!user)
                return cb(new Error('无效的user!'))

            if (user.user_id)
                var id = user.user_id.toString()

            if (user.business_id)
                var id = user.business_id.toString()

            var [err] = yield cache.hdel('jsonwebtoken', id, $)
            if (err) throw err

			if (cb) cb(null)

        } catch (e) {
			logger.warn(e)
			if (cb) cb(e)
        }
    })
}

/* 验证 token 中间件 */
token.decode = function(req, res, next) {
    lightco.run(function*($) {
        try {
            var _token
            if (req.headers && req.headers.authorization) {
                var parts = req.headers.authorization.split(' ')
                if (parts.length == 2) {
                    var scheme = parts[0]
                    var credentials = parts[1]
                    if (/^Bearer$/i.test(scheme))
                        _token = credentials
                }
            }
            if (!_token)
                return res.json(Conf.promise('1010'))

            var [err, decoded] = yield jwt.verify(_token, secret, $)
            if (err || !decoded) {
                return res.json(Conf.promise('1009'))
            }

            var id = decoded.id || ''
            var [err, token] = yield cache.hget('jsonwebtoken', id, $)
            if (err) throw err

            if (_token != token)
                return res.json(Conf.promise('1009'))

            var [err, user] = yield User.findById(id)
            if (err) throw err

            req.user = user
            return next()

        } catch (e) {
            logger.warn(e)
            res.json(Conf.promise('1'))
        }
    })
}

/* 验证 token 中间件  商家*/
token.business_decode =  function(req, res, next) {
    lightco.run(function*($) {
        try {

            var _token
            if (req.headers && req.headers.authorization) {
                var parts = req.headers.authorization.split(' ')
                if (parts.length == 2) {
                    var scheme = parts[0]
                    var credentials = parts[1]
                    if (/^Bearer$/i.test(scheme))
                        _token = credentials
                }
            }
            if (!_token)
                return res.json(Conf.promise('1010'))

            var [err, decoded] = yield jwt.verify(_token, secret, $)
            if (err || !decoded) {
                return res.json(Conf.promise('1009'))
            }

            var id = decoded.id || ''
            var [err, token] = yield cache.hget('jsonwebtoken', id, $)
            if (err) throw err

            if (_token != token)
                return res.json(Conf.promise('1009'))

            var [err, user] = yield Business.findById(id)
            if (err) throw err

            req.user = user
            return next()

        } catch (e) {
            logger.warn(e)
            res.json(Conf.promise('1'))
        }
    })
}

module.exports = token
