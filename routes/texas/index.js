'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()

router.use('/big', require('./big'))
router.use('/daily', require('./daily'))

module.exports = router
