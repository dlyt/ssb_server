'use strict'

const lightco = require('lightco')
const express = require('express')
const moment = require('moment')
const logger = log4js.getLogger('[routes-business-share]')
const router = express.Router()


const { Address,
        BigMatchSerie,
        BigMatchSerieShare,
        Casino,
        Organization } = Models


router.get('/', share)          //分享


function share(req, res) {
  lightco.run(function* ($) {
    try {

        if (req.query.id)
            var id = {bigMatchSerie_id: req.query.id}
        else
            return res.json(Conf.promise('2'))

        const opts = {
            include: [{
                model: BigMatchSerie, attributes: ['name', 'start_date', 'end_date'],
                include: [{
                    model: Organization, attributes: ['organization_id'],
                    include: [{
                        model: Casino, attributes: ['casino_id'],
                        include: [{
                            model: Address, attributes: ['address'],
                        }]
                    }]
                }]
            }],
            where: id || {},
        }

        var [err, share] = yield BigMatchSerieShare.scope('detail').findOne(opts)
        if (err) throw err

        share.bigMatchSerie.start_date = moment(share.bigMatchSerie.start_date).format('YYYY年MM月D日')
        share.bigMatchSerie.end_date = moment(share.bigMatchSerie.end_date).format('YYYY年MM月D日')

        res.json(Conf.promise('0', share))


    } catch (e) {
        logger.warn(e)
        return res.json(Conf.promise('1'))
    }
  })
}






module.exports = router
