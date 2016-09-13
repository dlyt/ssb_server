'use strict'

const lightco = require('lightco')
const express = require('express')
const router = express.Router()

const {User} = Models

router.use('/wechat', require('./wechat'))


module.exports = router
