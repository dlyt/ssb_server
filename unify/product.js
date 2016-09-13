'use strict'

const request = require('request')
const lightco = require('lightco')
const crypto = require('crypto')
const base32 = require('base32.js')
const logger = log4js.getLogger('[unify-produce]')
const des40 = Utility.des40

/*
	加密长度:40bit = 32bit + 8bit

	[x x x x] [x]
	   a      b

	a: 订单id
	b: padding = (user_id * orderDetail_id) % 256

 */

const exp = {
	serialNo: serialNo,
    verifyNo: verifyNo
}


function get_padding(serialNumber) {
    const v1 = serialNumber.user_id
    const v2 = serialNumber.orderDetail_id
    return (v1 * v2) % 256
}

/* 序列号生成 */
function serialNo(serialNumber, hex_key, cb) {
	const key = new Buffer(hex_key, 'hex')
	if (key.length != 5)
		return cb(new Error('秘钥长度不符合要求!'), null)

	const raw = new Buffer(5)
    const id = serialNumber.serialNumber_id
    const padding = get_padding(serialNumber)
    raw.writeUInt32BE(id, 0)
    raw.writeUInt8(padding, 4)

	const encoded = des40.encode(raw, key)
	const convert = new base32.Encoder()
	const result = convert.write(encoded).finalize()

	/* 生成时 要验证 */
	verifyNo(result, serialNumber, hex_key, (err, valid)=>{
		if (err)
			return cb(err, null)
		if (!valid)
			return cb(new Error('生成验证失败!'), null)

		cb(null, result)
	})
}

/* 验证序列号 */
function verifyNo(encoded, serialNumber, hex_key, cb) {
	const key = new Buffer(hex_key, 'hex')
	if (!key || key.length != 5)
		return cb(new Error('秘钥长度不符合要求!'), null)

	const convert = new base32.Decoder()
	const out = convert.write(encoded).finalize()
	if (!out || out.length != 5)
		return cb(new Error('密文长度不符合要求!'), null)

	const decoded = des40.decode(out, key)
    const id = decoded.readInt32BE(0)
    const padding = decoded.readUInt8(4)

    if (padding != get_padding(serialNumber))
        return cb(null, false)

    if (id != serialNumber.serialNumber_id)
        return cb(null, false)

    cb(null, true)
}


module.exports = exp
