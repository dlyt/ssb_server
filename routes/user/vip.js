'use strict'

const express = require('express')
const router = express.Router()
const lightco = require('lightco')
const logger = log4js.getLogger('[user-vip]')

const { User,
 		CasinoVip } = Models

router.get('/', vips)

function vips(req, res) {
    lightco.run(function*($) {
        try {
            const user = req.user

			const opts = {
				attributes: ['casino_id', 'casino', 'logo_url'],
				joinTableAttributes: ['vip_No']
			}

            var [err, vips] = yield user.getCasinos(opts)
            if (err) throw err

            return res.json(Conf.promise('0', vips))

        } catch (e) {
			logger.warn(e)
			return res.json(Conf.promise('1'))
        }
    })
}

module.exports = router;
