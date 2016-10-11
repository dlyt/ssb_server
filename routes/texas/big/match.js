'use strict'

const lightco = require('lightco')
const express = require('express')
const Sequelize = require('sequelize')
const router = express.Router()
const logger = log4js.getLogger('[routes-big-match]')
const toInt = Utility.toInt
const invalidDate = Utility.invalidDate
const webcache = Services.cache.webcache

router.get('/', webcache.get, matchs)
router.get('/:id', webcache.get, match)
router.get('/result/:id', webcache.get, match_result)
router.get('/setting/:id', webcache.get, match_setting)
router.post('/join/:id', Services.token.decode, match_join)

const { User,
        ExchangeRate,
        BigMatch,
        BigMatchSerie,
        Organization,
        Order,
        MatchSetting } = Models

function matchs(req, res) {
    lightco.run(function*($) {
        try {
            const def = Conf.const.big.match.limit_def
            const max = Conf.const.big.match.limit_max

            const opts = {
                order: [['last_update', req.query.order || 'DESC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def)
            }

            if (req.query.state)
                opts.where = {'state': toInt(req.query.state)}

            opts.limit = opts.limit > max ? max : opts.limit

            var [err, matchs] = yield BigMatch.scope('intro').findAndCountAll(opts)
            if (err) throw err

            if (matchs.count === 0) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', matchs)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function match(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)
            const opts = {
                include: [{
                    model: ExchangeRate,
                    attributes: ['exchangeRate_id', 'currency_name', 'exchange_rate', 'currency_code']
                }],
                where: {'bigMatch_id': id}
            }

            var [err, match] = yield BigMatch.scope('detail').findOne(opts)
            if (err) throw err

            if (match === null) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', match)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }

        } catch (e) {
          console.log(e);
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function match_result(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            var [err, match] = yield BigMatch.findById(id)
            if (err) throw err
            if (!match)
                return res.json(Conf.promise('3002'))

            var [err, result] = yield match.getBigMatchResult()
            if (err) throw err

            let pack = Conf.promise('0', result)

            yield webcache.set(req, JSON.stringify(pack), $)

            res.json(pack)

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function match_setting(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            var [err, match] = yield BigMatch.findById(id)
            if (err) throw err
            if (!match)
                return res.json(Conf.promise('3002'))

            var [err, setting] = yield MatchSetting.findById(match.matchSetting_id)
            if (err) throw err

            let pack = Conf.promise('0', setting)

            yield webcache.set(req, JSON.stringify(pack), $)

            res.json(pack)

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function match_join(req, res) {
    lightco.run(function*($) {
        try {
            const S = Sequelize
            const id = toInt(req.params.id)
            const amount = toInt(req.body.amount)
            const user = req.user

            if (!user.realName || !user.idCard)
                return res.json(Conf.promise('3009'))

            if (!user.passportID || !user.oneWayPermit)
                return res.json(Conf.promise('3010'))

            const order_amount_max = Conf.const.big.match.order_amount_max
            const order_total_max = Conf.const.big.match.order_total_max

            if (amount == 0)
                return res.json(Conf.promise('3005'))

            if (amount > order_amount_max)
                return res.json(Conf.promise('3007'))

            let opts = {
                attributes:[
                    [S.fn('DATE_FORMAT',S.col('match_day'),'%Y-%m-%d'), 'day'],
                    [S.fn('TIME_FORMAT',S.col('open_time'),'%H:%i:%s'), 'open'],
                    [S.fn('TIME_FORMAT',S.col('close_reg_time'),'%H:%i:%s'), 'close'],
                    'bigMatch_id',
                    'unit_price'
                ],
                include:[{
                    model: BigMatchSerie,
                    attributes: ['name'],
                    include: [{
                        model: Organization,
                        attributes: ['name']
                    }]
                }]
            }

            var [err, match] = yield BigMatch.findById(id, opts)
            if (err) throw err
            if (!match)
                return res.json(Conf.promise('3002'))

            /* 商家信息 */
            const serie = match.bigMatchSerie
            const organization = serie.organization
            /* 商品单价 */
            const unit_price = match.dataValues.unit_price
            /* 比赛日期 */
            const day = match.dataValues.day
            /* 开始时间 */
            const open = match.dataValues.open
            /* 结束时间 */
            const close = match.dataValues.close

            let begin = new Date(`${day} ${open}`)
            let end = new Date(`${day} ${close}`)

            if (invalidDate(end))
                throw new Error('无效的比赛时间')

            let now = new Date()
            if (now.getTime() > end.getTime())
                return res.json(Conf.promise('3004'))

            /* 商品描述 */
            const desc = `${organization.name} <${serie.name}> * ${amount}`

            if (isNaN(unit_price))
                throw new Error(`bigMatch:${id} 无效的价格!`)

            /* 商品总价 */
            const total = unit_price * amount

            if (total > order_total_max)
                return res.json(Conf.promise('3008'))

            const new_order = {
                user_id : user.user_id,
                bigMatch_id: match.bigMatch_id,
                order_No: Utility.orderId(),
                desc: desc,
                quantity: amount,
                have_pay: false,
                amount: total
            }

            var [err, order] = yield Order.create(new_order)
            if (err) throw err

            res.json(Conf.promise('0', order.order_id))

        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router
