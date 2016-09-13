'use strict'

const fs = require('fs')

/* app.secret 由微信生成 */
/* merchant.secret 由自己生成,在 pay.weixin.qq.com设置 */

let wechat = {
    ssb: {
        app: {
            appid: 'wx148eb8f66f47fb36',
            secret: 'e63b90207b9d09a2d76072c99fbc32ab'
        },
        merchant: {
            mch_id: '1379797402',
            secret: 'VPM3IEF14tWxM5Sq7MSXSGLcwBagveUM',
            cert: {
                pfx: fs.readFileSync(__dirname + '/cert/ssb_cert.p12'),
                passphrase: '1379797402'
            }
        }
    },
	url: {
        auth: {
            authorize: 'https://api.weixin.qq.com/sns/oauth2/access_token'
        },
		order: {
			unified: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
			query: 'https://api.mch.weixin.qq.com/pay/orderquery',
			close: 'https://api.mch.weixin.qq.com/pay/closeorder'
		},
		refund: {
			create: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
			query: 'https://api.mch.weixin.qq.com/pay/refundquery',
			statements: 'https://api.mch.weixin.qq.com/pay/downloadbill',
			report: 'https://api.mch.weixin.qq.com/payitil/report'
		}
	},
    /* 微信支付成功回调 指向后端服务器 */
	reply: 'http://121.43.61.192/notify/wechat'
}

module.exports = wechat
