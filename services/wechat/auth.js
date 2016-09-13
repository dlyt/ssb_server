'use strict'

const crypto = require('crypto')
const request = require('request')
const logger = log4js.getLogger('[services-wechat-request]')
const url = Conf.wechat.url

const app = Conf.wechat.ssb.app

const auth = {
	authorize: authorize,
}

/* wechat 登陆认证 code是客户端发来的 */
function authorize(code, cb) {
	const params = {
		appid: app.appid,
		secret: app.secret,
		grant_type: 'authorization_code',
		code: code
	}
	const opts = {
		url: url.auth.authorize,
		qs: params,
		json: true
	}
	request.get(opts, function(err, res, body){
		if (err) cb(err, body)

		cb(null, body)
	})
}



module.exports = auth
