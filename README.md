# @vandeurenglenn/base-x

> Fast, optimized, and compatible `base-x` encoding/decoding library.

This library is a high-performance drop-in replacement for the standard [base-x](https://github.com/cryptocoinjs/base-x) library. It includes transparent optimizations for power-of-2 bases (Base16, Base32, Base64), achieving **5x-7x faster** performance while maintaining full backward compatibility.

It also introduces optional **RFC 4648** compliance for standard Hex, Base32, and Base64 implementations.

## Install

```sh
npm i -S @vandeurenglenn/base-x
```

## Features

- **High Performance**: Automatically switches to a customized bitwise algorithm for bases that are powers of 2 (16, 32, 64), offering significant speedups over generic integer arithmetic.
- **Backwards Compatible**: By default, it mimics the behavior of the original `base-x` library (integer-based encoding, preserving leading zero characters), making it safe for use in cryptocurrency applications (e.g., Bitcoin Base58).
- **RFC 4648 Support**: Optional mode to strictly follow RFC standards (padding, 8-bit block alignment) for standard web/network use cases.
- **TypeScript**: First-class TypeScript support with included type definitions.

## Usage

### Standard Mode (Drop-in Replacement)
Behaves exactly like `base-x`. Note: This mode follows the "Bitcoin-style" integer encoding (leading zero preservation, no padding).

```js
import base from '@vandeurenglenn/base-x'

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const bs58 = base(BASE58)

const data = new Uint8Array([0, 255])
const encoded = bs58.encode(data)
console.log(encoded) // "1LU" (1 preserves the leading zero byte)

const decoded = bs58.decode(encoded)
console.log(decoded) // Uint8Array [0, 255]
```

### RFC 4648 Mode (Standard Base64/Hex/Base32)
Enable this mode if you need standard padding (`=`) and strict behavior matching built-in browser/Node.js methods.

```js
import base from '@vandeurenglenn/base-x'

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
// Enable RFC 4648 compliance
const b64 = base(BASE64, { rfc4648: true })

const data = new TextEncoder().encode('Hello World')

// Encodes with padding
const encoded = b64.encode(data)
console.log(encoded) // "SGVsbG8gV29ybGQ="

// Decodes standard Base64 string
const decoded = b64.decode(encoded)
console.log(new TextDecoder().decode(decoded)) // "Hello World"
```

## Performance

Benchmarks run on Node.js v25:

| Algorithm | @vandeurenglenn/base-x | standard base-x | Speedup |
|-----------|------------------------|-----------------|---------|
| **Base16**| ~3,400,000 ops/sec     | ~516,000 ops/sec| **~6.5x**|
| **Base32**| ~4,100,000 ops/sec     | ~680,000 ops/sec| **~6.0x**|
| **Base64**| ~4,900,000 ops/sec     | ~878,000 ops/sec| **~5.5x**|
| **Base58**| ~600,000 ops/sec       | ~594,000 ops/sec| ~1.0x   |

## License

MIT © [base-x contributors](https://github.com/cryptocoinjs/base-x) & Vandeuren Glenn
