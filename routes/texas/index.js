'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()
const logger = log4js.getLogger('[routes-match]')

router.use('/big', require('./big'))
router.use('/daily', require('./daily'))

module.exports = router
