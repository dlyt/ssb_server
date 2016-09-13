'use strict'

const lightco = require('lightco')
const redis = require('redis').createClient(Conf.db.redis)
const logger = log4js.getLogger('[services-cache]')

redis.on("error", function (err) {
	console.log("Error " + err)
})

let exp = {}

/* k-v set */
exp.set = function(key, value, expire, cb) {
	lightco.run(function *($){
		/* 原子操作 */
		const multi = redis.multi()

		if (typeof expire == 'function') {
			cb = expire
			expire = null
		}

		multi.set(key, value)
		if (expire)
			multi.expire(key, expire)

		var [err] = yield multi.exec($)
		if (cb) cb(err)
	})
}

/* k-v get */
exp.get = function(key, cb) {
	redis.get(key, (err, obj) => {
		if (err) logger.warn(err)
		if (cb) cb(err, obj)
	})
}

/* hash set */
exp.hset = function(key, cell, value, expire, cb) {
	lightco.run(function *($){
		const multi = redis.multi()

		if (typeof expire == 'function') {
			cb = expire
			expire = null
		}

		multi.hset(key, cell, value)
		if (expire)
			multi.expire(key, expire)

		var [err] = yield multi.exec($)
		if (cb) cb(err)
	})
}

/* hash get */
exp.hget = function(key, cell, cb) {
	redis.hget(key, cell, (err, obj) => {
		if (err) logger.warn(err)
		if (cb) cb(err, obj)
	})
}

/* hash del */
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

exp.webcache = {}

/* 存储 */
exp.webcache.set = function(req, string, opts, cb) {
	if (typeof(opts) == 'function') {
		cb = opts
		opts = {}
	}
	opts = opts || {}
	let expire = opts.expire || Conf.webcache.default_expire
	let method = req.method
	let url = req.originalUrl
	let key = `WEB_${method}_${url}`
	exp.set(key, string, expire, (err) => {
		if (err) logger.warn(err)
		if (cb) cb(err)
	})
}


/*  webcache 中间件 那个路由需要缓存就将此路由用app.use设置在真正处理函数之前
	比如:
 	router.get('/hot', webcache.get, hot) */
exp.webcache.get = function(req, res, next) {
	let method = req.method
	let url = req.originalUrl
	let key = `WEB_${method}_${url}`
	exp.get(key, (err, string) => {
		/* 命中缓存 */
		if (!err && string) {
			console.log(`${key} 命中!`)
			let type = req.headers['content-type']
			if (type)
				res.set('Content-Type', type)
			return res.send(string)
		}
		/* 未命中 */
		return next()
	})
}

module.exports = exp
