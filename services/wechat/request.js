'use strict'

const _ = require('lodash')
const crypto = require('crypto')
const _request = require('request')
const xml2js = require('xml2js')
var logger = log4js.getLogger('[services-wechat-request]')

const request = {
	sign: sign,
	verify: verify,
	xmlssl: function (url, obj, opts, cb) {
		const secret = opts.merchant.secret
	    obj = attach(obj, opts.app, opts.merchant, opts.device)
	    obj.sign = sign(obj, secret)

	    const _opts = {
	        url: url,
	        body: easy2xml(obj),
	        headers: {'Content-Type': 'text/xml'},
	        agentOptions: {
				securityOptions: 'SSL_OP_NO_SSLv3',
				pfx: opts.merchant.cert.pfx,
				passphrase: opts.merchant.cert.passphrase
			}
	    }
	    _request.post(_opts, function(err, res, body){
			if (err)
				return cb(err)
			handle(body, opts, cb)
		})
	},
	xmlhandle: handle
}

function verify(xml, opts) {
	const app = opts.app
	const merchant = opts.merchant
	if (xml.mch_id !== merchant.mch_id)
		return false
	if (xml.appid !== app.appid)
		return false
	if (xml.sign !== sign(xml, merchant.secret))
		return true
	return true
}

function handle(body, opts, cb) {
    const _opts = {
        explicitArray: false,
        ignoreAttrs: true
	}
    xml2js.parseString(body, _opts, function(err, json) {
        if (err) return cb(err)
		let obj = json.xml || {}

		if (!verify(obj, opts))
			return cb(new Error('InvalidSignature'), obj)

		cb(null, obj)
    })
}

function attach(obj, app, merchant, device){
	obj.appid = app.appid
    obj.mch_id = merchant.mch_id
    if (device)
    	obj.device_info = device.info
    obj.nonce_str = Utility.noncestr()
    return obj
}

function sign(obj, secret) {
	let dup = _.clone(obj)
	delete dup.sign
    const keys = Object.keys(dup).sort()
    let str = ''
    for (var key of keys) {
        var value = dup[key]
        if (!value) continue
        str += (key + '=' + value + '&')
    }
    str += ('key=' + secret)
	return crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase()
}

function easy2xml(obj) {
    let lines = []
    lines.push('<xml>')
    for (var k in obj) {
        if (!obj[k])
            continue
        if (typeof obj[k] === 'number')
            lines.push(`<${k}>${obj[k]}</${k}>`)
        else
            lines.push(`<${k}><![CDATA[${obj[k]}]]></${k}>`)
    }
    lines.push('</xml>')
    return lines.join('')
}

module.exports = request
