# base-x
> module compatible base-x

## install
```sh
npm i -S @vandeurenglenn/base-x
```

## usage

```js
const base = require('@vandeurenglenn/base-x')
// or
import base from '@vandeurenglenn/base-x'

const base32 = base('abcdefghijklmnopqrstuvwxyz234567') // base32 Alphabet

// encode
const uint8Array = new TextEncoder().encode('hi');
const bs32 = base32.encode(uint8Array)
console.log(bs32); // '2dj'

// decode
const hi = base32.decode(bs32)
const string = new TextDecoder().decode(hi);
console.log(string) // 'hi'

```
