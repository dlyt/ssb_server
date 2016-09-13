'use strict'

const express = require('express')
const router = express.Router()

router.use('/', require('./common'))
router.use('/casino', require('./casino'))
router.use('/texas', require('./texas'))
router.use('/user', require('./user'))
router.use('/ticket', require('./ticket'))
router.use('/order', require('./order'))
router.use('/notify', require('./notify'))

module.exports = router
