'use strict'

var crypto = require('crypto')

let user = {}

/* jsonwebtoken */
user.jwt = {}

/* jwt 盐 */
user.jwt.secret = '4a2227c0-6545-11e6-8a1a-b1ffb7b91410'

/* token 过期时间 90 天 */
user.jwt.expire = '90 days'

/* 用户密码设置 */
user.password = {}

/* password 盐 */
user.password.secret = 'cf7e5aa6-f379-408c-8306-520992afe43a'

/* 验证密码格式是否符合要求 */
user.password.verify_fmt = function(password) {
	if (!password || password.length < 6) {
		return false
	}
	return true
}

/* password -> md5 */
user.password.transform = function(password) {
	const secret = user.password.secret
	return crypto.createHash('md5').update(password).update(secret).digest('hex')
}

/* 用户登陆限制 */
user.try = {}

/* n秒钟内允许用户输入错误密码的次数 单位:秒 */
user.try.expire = 60
user.try.max = 2

/* 用户登陆限制 */
user.feedback = {}

/* n秒钟内允许用户输入错误密码的次数 单位:秒 */
user.feedback.expire = 900

module.exports = user
