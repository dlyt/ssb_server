'use strict'

const request = require('./request')
const auth = require('./auth')
const url = Conf.wechat.url

const opts = {
	app: Conf.wechat.ssb.app,
	merchant: Conf.wechat.ssb.merchant,
}

let wechat = {
	auth: {
		authorize: auth.authorize
	},
    order: {
		notify: function(body, cb) {
			request.xmlhandle(body, opts, cb)
		},
		verify: function(xml) {
			return request.verify(xml, opts)
		},
		response: function(res, error){
			res.set('Content-Type', 'text/xml')
			var xml = ''
			if (error) {
			  xml = '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[' + error + ']]></return_msg></xml>'
			} else {
			  xml = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>'
			}
			res.send(xml)
		},
        unified: function(data, cb) {
            request.xmlssl(url.order.unified, data, opts, function(err, data){
				if (err)
					return cb(err, data)
				/* 通信错误 */
				if (data.return_code != 'SUCCESS')
					return cb(new Error(`${data.return_msg}`))

				/* 业务错误 */
				if (data.result_code != 'SUCCESS') {
					switch (data.err_code) {
						/* 以下两种情况 视为业务错误 需重新生成订单 */
						case 'ORDERCLOSED':				/* 订单已关闭 */
						case 'OUT_TRADE_NO_USED':		/* 订单号重复 */
							return cb(null, null)
						/* 其余情况视为通信错误 */
						default:
							return cb(new Error(`${data.err_code}`))
					}
				}
				/* 成功 */
				let result = {
					appid: opts.app.appid,
					partnerid: data.mch_id,
					prepayid: data.prepay_id,
					noncestr: data.nonce_str,
					timestamp: parseInt(+new Date() / 1000, 10) + '',
					package: 'Sign=WXPay'
				}
				const secret = opts.merchant.secret
				result.sign = request.sign(result, secret)
				cb(null, result)
			})
        },
        query: function(data, cb) {
            request.xmlssl(url.order.query, data, opts, cb)
        },
        close: function(data, cb) {
            request.xmlssl(url.order.close, data, opts, cb)
        }
    },
    refund: {
        create: function(data, cb) {
            request.xmlssl(url.refund.create, data, opts, cb)
        },
        query: function(data, cb) {
            request.xmlssl(url.refund.query, data, opts, cb)
        },
        statements: function(data, cb) {
            request.xmlssl(url.refund.statements, data, opts, cb)
        },
        report: function(data, cb) {
            request.xmlssl(url.refund.report, data, opts, cb)
        }
    }
}


module.exports = wechat
