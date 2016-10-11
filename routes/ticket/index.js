'use strict'

const lightco = require('lightco')
const express = require('express')
const moment = require('moment')
const router = express.Router()
const logger = log4js.getLogger('[routes-ticket]')
const toInt = Utility.toInt
const verifyNo = Unify.product.verifyNo

router.get('/', Services.token.decode, tickets)
router.get('/:id', Services.token.decode, ticket)
router.post('/verify', verify)

const { User,
        Order,
        OrderDetail,
        SerialNumber,
        GlobalSetting,
        UserPoint,
        DailyMatch,
        DailyMatchSerie,
        BigMatch,
        BigMatchSerie,
        Casino,
        Organization } = Models

function tickets(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user
            const def = Conf.const.ticket.limit_def
            const max = Conf.const.ticket.limit_max

            let query = [{user_id: user.user_id}]

            if (req.query.used)
                  var used = toInt(req.query.used)

            query.push({have_used: req.query.used})

            let opts = {
                where: {name: 'ticket_show_expire'}
            }
            /* 查找显示已使用天数的设置 */
            var [err, settings] = yield GlobalSetting.findOne(opts)
            if (err) throw err

            let show_day = 7
            if (settings && settings.int)
                show_day = settings.int

            /* 小于此时间的不显示 */
            const timeline = new Date(moment().subtract(show_day, 'days'))

            if (used === 1)
                  query.push({used_time: {$gt: timeline}})

            const include = [{
                    model: OrderDetail, attributes: ['orderDetail_id'],
                    include: [{
                        model: Order, attributes: ['bigMatch_id', 'dailyMatch_id'],
                    }]
            }]

            opts = {
                include: include,
                where: {$and: query},
                order: [['used_time', 'DESC'], ['create_time', 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def)
            }

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, tickets] = yield SerialNumber.scope('intro').findAndCountAll(opts)
            if (err) throw err

            if (tickets.count === 0) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', casinos)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }

            var data = tickets.rows

            for (var i = 0 , length = data.length; i < length; i++) {
                  var bigMatch_id = data[i].orderDetail.order.bigMatch_id
                  var dailyMatch_id = data[i].orderDetail.order.dailyMatch_id
                  if (bigMatch_id == null) {
                        const opt = {
                            include: [{
                                model: DailyMatchSerie,
                                include: [{
                                    model: Organization,
                                    include: [{
                                        model: Casino,
                                    }]
                                }]
                            }],
                            where: {'dailyMatch_id': dailyMatch_id}
                        }

                        var [err, casinoName] = yield DailyMatch.find(opt)
                        if (err) throw err

                        data[i].dataValues.casinoName = casinoName.dailyMatchSerie.organization.casino.casino
                        data[i].dataValues.matchName = casinoName.dailyMatchSerie.name
                  } else {
                        const opt = {
                            include: [{
                                model: BigMatchSerie,
                                include: [{
                                    model: Organization,
                                    include: [{
                                        model: Casino,
                                    }]
                                }]
                            }],
                            where: {'bigMatch_id': bigMatch_id}
                        }
                        var [err, casinoName] = yield BigMatch.find(opt)
                        if (err) throw err

                        data[i].dataValues.casinoName = casinoName.bigMatchSerie.organization.casino.casino
                        data[i].dataValues.matchName = casinoName.bigMatchSerie.name
                  }
            }

            res.json(Conf.promise('0', tickets))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function ticket(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user
            const id = req.params.id
            const opts = {
                where: {'user_id': user.user_id}
            }

            var [err, ticket] = yield SerialNumber.scope('detail').findById(id, opts)
            if (err) throw err

            if (ticket === null) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', ticket)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }

        } catch (e) {
			logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}

function verify(req, res) {
    lightco.run(function*($) {
        var transaction
        try {
            const big = req.body.big
            const daily = req.body.daily
            const code = req.body.code

            if (!code)
                return res.json(Conf.promise('4000'))

            if (!big && !daily)
                return res.json(Conf.promise('4001'))

            let opts = {
                include: [{
                    model: OrderDetail,
                    include: [{
                        model: Order
                    }]
                }],
                where: {seria_No: code}
            }

            if (big)
                opts.where.bigMatchSerie_id = big
            else if (daily)
                opts.where.dailyMatchSerie_id = daily

            var [err, ticket] = yield SerialNumber.findOne(opts)
            if (err) throw err

            if (!ticket)
                return res.json(Conf.promise('4000'))

            if (!ticket.valid)
                return res.json(Conf.promise('4004'))

            if (ticket.have_used)
                return res.json(Conf.promise('4002'))

            if (ticket.expire_time) {
                let now = new Date()
                if (now.getTime() > ticket.expire_time.getTime())
                    return res.json(Conf.promise('4003'))
            }

            /* 修改 ticket 状态并生成积分 */
            var [err, transaction] = yield sequelize.transaction()
            if (err) throw err

            opts = {transaction: transaction}

            /* 10元 = 1 积分 */
            let point = parseInt(ticket.orderDetail.order.amount) / 10
            let new_point = {
                add_point: point,
                user_id: ticket.user_id,
                serialNumber_id: ticket.serialNumber_id
            }
            var [err] = yield UserPoint.create(new_point, opts)
            if (err) throw err

            /* user 积分 累加 */
            var [err, user] = yield User.findById(ticket.user_id, opts)
            if (err) throw err

            user.userPoint += point

            var [err] = yield user.save(opts)
            if (err) throw err

            /* 更改 ticket 使用状态 */
            ticket.used_time = new Date()
            ticket.have_used = true

            var [err, update] = yield ticket.save(opts)
            if (err) throw err

            transaction.commit()

            res.json(Conf.promise('0'))

        } catch (e) {
			logger.warn(e)
            if (transaction) transaction.rollback()
			return res.json(Conf.promise('1'))
        }
    })
}


module.exports = router
