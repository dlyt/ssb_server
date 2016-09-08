var des40 = require('./')


const raw = new Buffer(6)
raw.writeUInt32BE(0x11223344, 0)
raw.writeUInt8(0xff, 4)

const key = new Buffer('abcd2')


console.log(raw)
console.log(raw.toString('hex'));

const encode = des40.encode(raw, key)
console.log(encode)

const decode = des40.decode(encode, key)
console.log(decode)
