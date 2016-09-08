'use strict'

const request = require('request')
const lightco = require('lightco')
const logger = log4js.getLogger('[unify-payment]')
const wechat = Services.wechat

const { User,
        Order,
        Payment } = Models


const exp = {
	refresh: refresh
}

const refreshs = [
	wechat_refresh,		/* 0 wechat */
	null,				/* 1 aliPay */
	null				/* 2 余额 */
]

function refresh(payment, cb) {
	let func = refreshs[payment.pay_type]
	if (!func)
		return cb(new Error('未知的支付类型'))
	return func(payment, cb)
}

function wechat_refresh(payment, cb) {
	const data = {
		out_trade_no: payment.payment_No
	}
	wechat.order.query(data, function(err, ret){
		if (err) return cb(err)
		//console.log(ret)
		if (ret.return_code == 'SUCCESS') {
			payment.last_update = Date.now()
			payment.trade_state = ret.trade_state
			payment.trade_state_desc = ret.trade_state_desc

			switch (ret.trade_state) {
				case 'NOTPAY':				/* 未支付 */
				case 'USERPAYING':			/* 用户支付中 */
					payment.state = 0
					break

				case 'SUCCESS':				/* 交易成功 */
					payment.state = 1
					payment.trade_state_desc = ''
					payment.certificate = ret.transaction_id
					payment.time_end = ret.time_end
					break

				case 'REFUND':				/* 转入退款 */
				case 'CLOSED':				/* 已关闭 */
				case 'REVOKED':				/* 已撤销 */
				case 'PAYERROR': 			/* 其他原因失败 */
					payment.state = 2
					break
				default:
					return cb(new Error(`未知的微信支付交易状态${ret.trade_state}`))
			}
			return cb(null, true)
		}
		/* 请求失败 */
		return cb(new Error(ret.return_msg))
	})
}

module.exports = exp
