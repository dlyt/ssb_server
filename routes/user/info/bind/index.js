'use strict'

const express = require('express')
const router = express.Router()

router.use('/mobile', require('./mobile'))
router.use('/wechat', require('./wechat'))

module.exports = router
