'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()
const logger = log4js.getLogger('[routes-notify-wechat]')
const wechat = Services.wechat

router.post('/', notify)

const { Order,
        Payment } = Models


function notify(req, res) {
    lightco.run(function*($) {
        try {
            const json = req.body.xml

            if (!wechat.order.verify(json))
                throw new Error('xml 验证失败!')

            const opts = {
                include: [{model: Order}],
                where: {payment_No: json.out_trade_no}
            }
            var [err, payment] = yield Payment.findOne(opts)
            if (err) throw err

            const order = payment.order

            if (!order.have_pay) {
                var [err, update] = yield Unify.order.refresh(order, $)
                if (err) throw err
                if (!update) throw new Error('主动查询订单支付结果失败!')
            }

            return wechat.order.response(res)

        } catch (e) {
            logger.warn(e)
            return wechat.order.response(res, e)
        }
    })
}

module.exports = router
