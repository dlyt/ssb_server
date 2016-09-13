'use strict'

const lightco = require('lightco')
const async = require('async')
const request = require('request')
const express = require('express')
const router = express.Router()
const logger = log4js.getLogger('[routes-order]')
const wechat = Services.wechat
const toInt = Utility.toInt

router.get('/', Services.token.decode, orders)
router.get('/:id', Services.token.decode, order)
router.post('/pay/:id', Services.token.decode, order_pay)

const { User,
        Order,
        DailyMatch,
        DailyMatchSerie,
        BigMatch,
        BigMatchSerie,
        Organization,
        Casino,
        Payment } = Models

function orders(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user
            const def = Conf.const.order.limit_def
            const max = Conf.const.order.limit_max

            const Match = order.bigMatch_id ? BigMatch : DailyMatch
            const Serie = order.bigMatch_id ? BigMatchSerie : DailyMatchSerie

            const opts = {
                where: {user_id: user.user_id},
                order: [['last_update', 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def),
                transaction: transaction,
                include: [{
                    model: Match,
                    attributes: ['match_day'],
                    include: [{
                        model: Serie,
                        attributes: ['name'],
                        include: [{
                            model: Organization,
                            attributes: ['name'],
                            include: [{
                                model: Casino,
                                attributes:['casino', 'logo_url']
                            }]
                        }]
                    }]
                }]
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, orders] = yield Order.scope('intro').findAndCountAll(opts)
            if (err) throw err

            res.json(Conf.promise('0', orders))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}


function order(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user
            const id = req.params.id

            let opts = {
                where: {user_id: user.user_id}
            }
            var [err, order] = yield Order.findById(id, opts)
            if (err) throw err

            if (!order)
                return res.json(Conf.promise('2000'))
    
            if (!order.have_pay) {
                var [err, update] = yield Unify.order.refresh(order, $)
                if (err) throw err
                if (update) order = update
            }

            return res.json(Conf.promise('0', order))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function order_pay(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user
            const id = toInt(req.params.id)
            const type = toInt(req.body.type)

            let opts = {
                where: {user_id: user.user_id}
            }

            var [err, order] = yield Order.findById(id, opts)
            if (err) throw err
            if (!order)
                return res.json(Conf.promise('2000'))

            if (order.have_pay)
                return res.json(Conf.promise('2001'))

            var [err, canpay] = yield Unify.order.canpay(order, $)
            if (err) throw err
            if (!canpay)
                return res.json(Conf.promise('2002'))

            opts = {
                where: {
                    order_id: order.order_id,
                    state: 0,
                    pay_type: type
                }
            }
            var [err, payment] = yield Payment.findOne(opts)
            if (err) throw err

            /* 创建新支付 */
            if (!payment) {
                const new_payment = {
                    order_id: order.order_id,
                    payment_No: Utility.paymentId(),
                    amount: order.amount,
                    state: 0,
                    pay_type: type
                }
                var [err, payment] = yield Payment.create(new_payment)
                if (err) throw err
                if (!payment) throw new Error(`order:${order.order_id} 创建payment失败`)
            }

            const fen = Math.ceil(payment.amount * 100)
            const data = {
                body: order.desc,
                out_trade_no: payment.payment_No,
                total_fee: fen,
                spbill_create_ip: Utility.clientIpV4(req),
                trade_type: 'APP',
                notify_url: Conf.wechat.reply
            }
            var [err, result] = yield Services.wechat.order.unified(data, $)
            if (err) {
                if (result) err = new Error(result.return_msg)
                throw err
            }

            if (!result) {
                payment.state = 2
                var [err] = yield payment.save()
                if (err) throw err

                return res.json(Conf.promise('1'))
            }

            res.json(Conf.promise('0', result))

        } catch (e) {
			logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}


module.exports = router
