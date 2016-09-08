'use strict'

let exp = {}

exp.apikey = 'aefb4bbbae8f2d38a4a237fc4d7b9623'

/* 发送短信超时时间 3秒 单位:毫秒 */
exp.timeout = 3000

/* 验证码有效期 10分钟 单位:秒 */
exp.expire = 600

/* 验证码有效期内可发送条数  */
exp.max = 2

/* 国内验证码 */
exp.yzm = 'https://api.dingdongcloud.com/v1/sms/sendyzm'

/* 国际验证码 */
exp.gjyzm = 'https://api.dingdongcloud.com/v1/sms/sendgjyzm'

/* 国内通知 */
exp.tz = 'https://api.dingdongcloud.com/v1/sms/sendtz'


/* 短信模板 */
exp.tpl = {
	/* 注册 */
	register: function(code) {
		return `【赛事宝】您的验证码是：${code}，请在10分钟内输入，如非本人操作请注意账号安全。`
	},

	/* 找回密码 */
	retrieve: function(code) {
		return `【赛事宝】您的验证码是：${code}，请在10分钟内输入，如非本人操作请注意账号安全。`
	},

	/* 微信登陆 绑定手机 */
	bind: function(code) {
		return `【赛事宝】您的验证码是：${code}，请在10分钟内输入，如非本人操作请注意账号安全。`
	}
}

module.exports = exp
