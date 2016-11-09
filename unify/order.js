'use strict'

const _ = require('lodash')
const request = require('request')
const lightco = require('lightco')
const Sequelize = require('sequelize')
const async = require('async')
const logger = log4js.getLogger('[unify-order]')
const moment = require('moment')
const payment_refresh = require('./payment').refresh
const product_serialNo = require('./product').serialNo
const invalidDate = Utility.invalidDate

const { User,
        DailyMatch,
        DailyMatchSerie,
        BigMatch,
        BigMatchSerie,
        Order,
        OrderDetail,
        SerialNumber,
        Secret,
        Payment,
        GlobalSetting } = Models

const exp = {
	refresh: order_refresh,
    canpay: order_canpay
}

function _refresh(payments, cb) {
	lightco.run(function*($) {
        var transaction
        try {
			if (!payments || !payments.length)
				return cb(null, [])

			var [err, transaction] = yield sequelize.transaction()
            if (err) throw err

			function idt (payment, cb) {
				payment_refresh(payment, (err, updated) => {
					if (err) return cb(err)
					const opts = {transaction: transaction}
					payment.save(opts)
								.then(value => cb(null, value))
								.catch(err => cb(err))
				})
			}

            /* async 并发操作 http://caolan.github.io/async/ */
            var [err, results] = yield async.map(payments, idt, $)
            if (err) throw err

			transaction.commit()

            return cb(null, results)

        } catch (e) {
            logger.warn(e)
            if (transaction) transaction.rollback()
            return cb(e)
        }
    })
}

/* 刷新订单状态 */
function order_refresh(order, cb) {
	lightco.run(function*($) {
        var transaction
        try {
      			var [err, transaction] = yield sequelize.transaction()
                  if (err) throw err

      			let opts = {
      				transaction: transaction
      			}

            /* 先锁 */
            order.last_update = new Date()
            [err, order] = yield order.save(opts)
            if (err) throw err

            [err, order] = Order.findById(order.order_id, opts)
            if (err) throw err

            /* 再查 */
            if (order.have_pay) {
                transaction.rollback()
                return cb(null, null)
            }

            /* 获取全部支付凭证 */
            var [err, payments] = yield order.getPayments()
            if (err) throw err

            /* 没有支付记录 */
      			if (!payments || !payments.length) {
      				transaction.rollback()
      				return cb(null, null)
      			}

			      var [err, results] = yield _refresh(payments, $)
            if (err) throw err

            /* 查找是否有已支付流水 */
      			let payed_payment = _.find(results, {state: 1})

      			if (!payed_payment) {
      				transaction.rollback()
      				return cb(null, null)
      			}

      			/* 支付成功 */
      			order.have_pay = true
      			var [err, updated] = yield order.save(opts)
      			if (err) throw err

            /* 数量验证 */
            var [err, count] = yield order.countOrderDetails(opts)
			      if (err) throw err

            if (count !== 0)
                throw new Error('门票的detail数量非法!')

            /* 查询比赛所属系列 */
            let bigMatchSerie_id , dailyMatchSerie_id, hex_key

            /* 过期时间 */
            let create_time = new Date()
            let expire_time = null

            /* 大赛 */
            if (order.bigMatch_id) {
                let opts = {
                        model: BigMatchSerie,
                        where: {bigMatch_id: order.bigMatch_id},
                }

                /* 查找系类id 和 秘钥 */
                var [err, serie] = yield BigMatch.findOne(opts)
                if (err) throw err

                bigMatchSerie_id = serie.bigMatchSerie_id

                const match_day = serie.match_day
                const close_reg_time = serie.close_reg_time

                const expireTime = match_day + ' ' + close_reg_time
                expire_time = moment(expireTime).tz('Asia/Shanghai').format()

            }

            /* 日赛 */
            if (order.dailyMatch_id) {
                let opts = {
                    include: [
                        {model: DailyMatch, where: {dailyMatch_id: order.dailyMatch_id}},
                        {model: Secret}
                    ],
                }
                var [err, serie] = yield DailyMatchSerie.findOne(opts)
                if (err) throw err

                dailyMatchSerie_id = serie.dailyMatchSerie_id
                hex_key = serie.secret.key

                opts = {
                    where: {name: 'dailyMatch_expire'}
                }
                var [err, settings] = yield GlobalSetting.findOne(opts)
                if (err) throw err

                if (settings && settings.int)
                    expire_time = new Date(moment().add(settings.int, 'days'))
            }

            if (!hex_key)
                throw new Error(`${order.order_id} 所属比赛秘钥为空`)

            if (!bigMatchSerie_id && !dailyMatchSerie_id)
                throw new Error(`${order.order_id} 所属没有关联相关比赛`)

            function idt(n, cb) {
                lightco.run(function* ($){
                    const new_detail = {
                        order_id: order.order_id,
                        have_createSerial: true
                    }

                    /* 创建订单明细 */
                    var [err, detail] = yield OrderDetail.create(new_detail, opts)
                    if (err) return cb(err)

                    const new_serial = {
                        user_id: order.user_id,
                        orderDetail_id: detail.orderDetail_id,
                        have_used: false,
                        desc: order.desc,
                        dailyMatchSerie_id: dailyMatchSerie_id,
                        bigMatchSerie_id: bigMatchSerie_id,
                        valid: true,
                        create_time: create_time,
                        expire_time: expire_time
                    }

                    /* 创建序列号 */
                    var [err, serial] = yield SerialNumber.create(new_serial, opts)
                    if (err) return cb(err)

                    /* 生成8位序列号 */
                    var [err, code] = yield product_serialNo(serial, hex_key, $)
                    if (err) return cb(err)


                    serial.seria_No = code

                    /* 保存 */
                    var [err] = yield serial.save(opts)
                    if (err) return cb(err)

                    cb(null, null)

                    // var search = function () {
                    //     lightco.run(function*($) {
                    //         try {
                    //           /* 生成12位序列号 */
                    //           var code = Utility.rand12()
                    //
                    //           var [err, serialNumber] = yield SerialNumber.findOne({where: {seria_No: code}})
                    //           if (err) throw err
                    //
                    //           if (serialNumber) {
                    //               search()
                    //           } else {
                    //
                    //               serial.seria_No = code
                    //
                    //               /* 保存 */
                    //               var [err] = yield serial.save(opts)
                    //               if (err) return cb(err)
                    //
                    //               cb(null, null)
                    //           }
                    //
                    //
                    //         } catch (e) {
                    //             logger.warn(e)
                    //             if (transaction) transaction.rollback()
                    //             return cb(e, null)
                    //         }
                    //     })
                    // }
                    //
                    // search()



                })
            }

            /* 根据数量生成 orderDetail 和 serial */
            var [err] = yield async.times(order.quantity, idt, $)
            if (err) throw err

			      transaction.commit()

            return cb(null, updated)

        } catch (e) {
            logger.warn(e)
            if (transaction) transaction.rollback()
            return cb(e, null)
        }
    })
}

/*  判断订单是否可以继续支付 */
function big_canpay(order, cb) {
    lightco.run(function*($) {
        try {
            const id = order.bigMatch_id
            const S = Sequelize
            const opts = {
                attributes:[
                    [S.fn('DATE_FORMAT',S.col('match_day'),'%Y-%m-%d'), 'day'],
                    [S.fn('TIME_FORMAT',S.col('open_time'),'%H:%i:%s'), 'open'],
                    [S.fn('TIME_FORMAT',S.col('close_reg_time'),'%H:%i:%s'), 'close']
                ],
                raw: true
            }
            var [err, match] = yield BigMatch.findById(id, opts)
            if (err) throw err
            if (!match)
                throw new Error('没有找到相关比赛!')

            let begin = new Date(`${match.day} ${match.open}`)
            let end = new Date(`${match.day} ${match.close}`)

            if (invalidDate(end))
                throw new Error('无效的比赛时间')

            let now = new Date()

            if (now.getTime() > end.getTime())
                return cb(null, false)

            return cb(null, true)

        } catch (e) {
            logger.warn(e)
            return cb(e, null)
        }
    })
}

/*  判断订单是否可以继续支付 */
function daily_canpay(order, cb) {
    lightco.run(function*($) {
        try {
            const id = order.dailyMatch_id
            const S = Sequelize
            const opts = {
                attributes:[
                    [S.fn('DATE_FORMAT',S.col('match_day'),'%Y-%m-%d'), 'day'],
                    [S.fn('TIME_FORMAT',S.col('start_time'),'%H:%i:%s'), 'open'],
                    [S.fn('TIME_FORMAT',S.col('close_reg_time'),'%H:%i:%s'), 'close']
                ],
                raw: true
            }
            var [err, match] = yield DailyMatch.findById(id, opts)
            if (err) throw err
            if (!match)
                throw new Error('没有找到相关比赛!')

            let begin = new Date(`${match.day} ${match.open}`)
            let end = new Date(`${match.day} ${match.close}`)

            if (invalidDate(end))
                throw new Error('无效的比赛时间')

            let now = new Date()

            if (now.getTime() > end.getTime())
                return cb(null, false)

            return cb(null, true)

        } catch (e) {
            logger.warn(e)
            return cb(e, null)
        }
    })
}

function order_canpay(order, cb) {
    if (order.bigMatch_id)
        return big_canpay(order, cb)

    if (order.dailyMatch_id)
        return daily_canpay(order, cb)

    cb(new Error('没有关联到任何比赛的订单!'))
}

module.exports = exp
