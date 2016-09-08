'use strict'

const lightco = require('lightco')
const redis = require('redis').createClient(Conf.db.redis)
const logger = log4js.getLogger('[services-cache]')

redis.on("error", function (err) {
	console.log("Error " + err)
})

let exp = {}

exp.hset = function(key, cell, value, expire, cb) {
	if (typeof expire == 'function') {
		cb = expire
		expire = null
	}

	lightco.run(function *($){
		var [err] = yield redis.hset(key, cell, value, $)
		if (err) {
			logger.warn(err)
			if (cb) cb(err)
			return
		}

		if (expire) {
			var [err] = yield redis.expire(key, expire, $)
			if (err) {
				logger.warn(err)
				if (cb) cb(err)
				return
			}
		}
		if (cb) cb(null)
	})
}

exp.hget = function(key, cell, cb) {
	redis.hget(key, cell, (err, obj) => {
		if (err) logger.warn(err)
		if (cb) cb(err, obj)
	})
}

exp.hdel = function(key, cell, cb) {
	redis.hdel(key, cell, (err, obj) => {
		if (err) logger.warn(err)
		if (cb) cb(err, obj)
	})
}

exp.hgetall = function(key, cb) {
	redis.hgetall(key, (err, obj) => {
		if (err) logger.warn(err)
		if (cb) cb(err, obj)
	})
}


module.exports = exp
