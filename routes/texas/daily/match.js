'use strict'

const lightco = require('lightco')
const express = require('express')
const Sequelize = require('sequelize')
const router = express.Router()
const logger = log4js.getLogger('[routes-daily-match]')
const toInt = Utility.toInt
const dateFormat = Utility.dateFormat
const invalidDate = Utility.invalidDate
const webcache = Services.cache.webcache

router.get('/', webcache.get, matchs)
router.get('/:id', webcache.get, match)
router.get('/result/:id', webcache.get, match_result)
router.post('/join/:id', Services.token.decode, match_join)

const { User,
        DailyMatch,
        DailyMatchSerie,
        DailyMatchResult,
        Organization,
        Order,
        MatchSetting } = Models

function matchs(req, res) {
    lightco.run(function*($) {
        try {
            const def = Conf.const.daily.match.limit_def
            const max = Conf.const.daily.match.limit_max

            if (req.query.casino_id)
                var casino_id = {casino_id: req.query.casino_id}

            if (req.query.match_day)
                var match_day = {match_day: req.query.match_day}

            const include = [{
                model: DailyMatchSerie, attributes: ['dailyMatchSerie_id', 'name', 'organization_id'],
                include: [{
                    model: Organization, attributes: ['casino_id'],
                    where: casino_id || {}
                }]
            }, {
                model: DailyMatchResult, attributes: ['name', 'result'],
            }]

            const opts = {
                include: include,
                where: match_day || {},
                order: [['start_time', req.query.order || 'ASC']],
                offset: toInt(req.query.offset, 0),
                limit: toInt(req.query.limit, def)
            }
            opts.limit = opts.limit > max ? max : opts.limit

            var [err, matchs] = yield DailyMatch.scope('intro').findAndCountAll(opts)
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

            var [err, match] = yield DailyMatch.scope('detail').findById(id)
            if (err) throw err

            if (match === null) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', match)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }



        } catch (e) {
            logger.warn(e)
            return res.json(Conf.promise('1'))
        }
    })
}

function match_result(req, res) {
    lightco.run(function*($) {
        try {
            const id = toInt(req.params.id)

            var [err, match] = yield DailyMatch.findById(id)
            if (err) throw err
            if (!match)
                return res.json(Conf.promise('3002'))

            var [err, result] = yield match.getDailyMatchResult()
            if (err) throw err

            if (result === null) {
                  return res.json(Conf.promise('3'))
            } else {
                  let pack = Conf.promise('0', result)

                  yield webcache.set(req, JSON.stringify(pack), $)

                  res.json(pack)
            }



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

            const order_amount_max = Conf.const.daily.match.order_amount_max
            const order_total_max = Conf.const.daily.match.order_total_max

            if (amount == 0)
                return res.json(Conf.promise('3005'))

            if (amount > order_amount_max)
                return res.json(Conf.promise('3007'))

            let opts = {
                attributes:[
                    [S.fn('DATE_FORMAT',S.col('match_day'),'%Y-%m-%d'), 'day'],
                    [S.fn('TIME_FORMAT',S.col('start_time'),'%H:%i:%s'), 'open'],
                    [S.fn('TIME_FORMAT',S.col('close_reg_time'),'%H:%i:%s'), 'close'],
                    'state',
                    'dailyMatch_id',
                    'unit_price'
                ],
                include:[{
                    model: DailyMatchSerie,
                    attributes: ['name'],
                    include: [{
                        model: Organization,
                        attributes: ['name']
                    }]
                }]
            }

            var [err, match] = yield DailyMatch.findById(id, opts)
            if (err) throw err

            if (!match)
                return res.json(Conf.promise('3002'))

            if (match.state != 1)
                return res.json(Conf.promise('3011'))

            /* 商家信息 */
            const serie = match.dailyMatchSerie
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
            const desc = `${organization.name} <${serie.name}> x ${amount}`

            if (!unit_price || isNaN(unit_price))
                throw new Error(`dailyMatch:${id} 无效的价格!`)

            /* 商品总价 */
            const total = unit_price * amount

            if (total > order_total_max)
                return res.json(Conf.promise('3008'))

            const new_order = {
                user_id : user.user_id,
                dailyMatch_id: match.dailyMatch_id,
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
