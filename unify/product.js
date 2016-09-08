'use strict'

const request = require('request')
const lightco = require('lightco')
const crypto = require('crypto')
const base32 = require('base32.js')
const logger = log4js.getLogger('[unify-produce]')
const des40 = Utility.des40

const exp = {
	serialNo: serialNo,
    verifyNo: verifyNo
}

function get_padding(serialNumber) {
    const v1 = serialNumber.user_id
    const v2 = serialNumber.orderDetail_id
    return (v1 * v2) % 256
}

/* 调用此函数 要 try catch 包裹 */
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

	verifyNo(result, serialNumber, hex_key, (err, valid)=>{
		if (err)
			return cb(err, null)
		if (!valid)
			return cb(new Error('生成验证失败!'), null)

		cb(null, result)
	})
}

/* 调用此函数 要 try catch 包裹 */
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
