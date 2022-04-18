const base = require('./dist/base-x')
const base32 = base('abcdefghijklmnopqrstuvwxyz234567')

// const uint8Array = new Uint8Array(2)
// uint8Array[0] = Buffer.from('h').toString('hex')
// uint8Array[1] = Buffer.from('i').toString('hex')
const uint8Array = new TextEncoder().encode('hi');
const bs32 = base32.encode(uint8Array)
console.log(bs32);
const hi = base32.decode(bs32)
const string = new TextDecoder().decode(hi);
// let str = ''
// hi.forEach((item, i) => {
//   str+= Buffer.from(item.toString(), 'hex').toString()
// });
// console.log(hi);

console.log(string === 'hi');
