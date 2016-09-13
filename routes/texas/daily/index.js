'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()

router.use('/serie', require('./serie'))
router.use('/match', require('./match'))

module.exports = router
