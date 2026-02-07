/**
 *  string containing only given ALPHABET letters/numbers
 */
type baseString = string;

type BaseXOptions = {
  rfc4648?: boolean;
};

type baseX = {
  encode: (uint8Array: Uint8Array | ArrayBuffer | number[]) => baseString;
  decode: (string: baseString) => Uint8Array;
  decodeUnsafe: (string: baseString) => Uint8Array | undefined;
};

// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Copyright (c) 2026 Vandeuren Glenn
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
const base = (ALPHABET: string, options: BaseXOptions = {}): baseX => {
  if (ALPHABET.length >= 255) {
    throw new TypeError("Alphabet too long");
  }
  const BASE_MAP = new Uint8Array(256);
  for (let j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (let i = 0; i < ALPHABET.length; i++) {
    const x = ALPHABET.charAt(i);
    const xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + " is ambiguous");
    }
    BASE_MAP[xc] = i;
  }
  const BASE = ALPHABET.length;
  const LEADER = ALPHABET.charAt(0);
  const LEADER_CODE = ALPHABET.charCodeAt(0);
  const FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
  const iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up

  // Optimization: If BASE is a power of 2, we can use bitwise operations
  // This is much faster than the generic algorithm (approx 10x-20x)
  const isPowerOfTwo = (BASE & (BASE - 1)) === 0;
  if (isPowerOfTwo) {
    const k = Math.log2(BASE);
    const mask = (1 << k) - 1;

    if (options.rfc4648) {
      // RFC 4648 Mode
      const encode = (source: Uint8Array | ArrayBuffer | number[]): string => {
        if (source instanceof Uint8Array) {
        } else if (ArrayBuffer.isView(source)) {
          source = new Uint8Array(
            source.buffer,
            source.byteOffset,
            source.byteLength,
          );
        } else if (Array.isArray(source)) {
          source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) {
          throw new TypeError("Expected Uint8Array");
        }
        if (source.length === 0) {
          return "";
        }

        let str = "";
        let currentValue = 0;
        let currentBits = 0;

        for (let i = 0; i < source.length; i++) {
          currentValue = (currentValue << 8) | source[i];
          currentBits += 8;

          while (currentBits >= k) {
            currentBits -= k;
            str += ALPHABET.charAt((currentValue >>> currentBits) & mask);
          }
        }

        // Leftover bits (padding logic for the last character)
        if (currentBits > 0) {
          str += ALPHABET.charAt((currentValue << (k - currentBits)) & mask);
        }

        // Add padding chars '=' if required
        while ((str.length * k) % 8 !== 0) {
          str += "=";
        }
        return str;
      };

      const decodeUnsafe = (source: string): Uint8Array | undefined => {
        if (typeof source !== "string") {
          throw new TypeError("Expected String");
        }
        if (source.length === 0) {
          return new Uint8Array();
        }

        // Strip padding
        let end = source.length;
        while (end > 0 && source[end - 1] === "=") {
          end--;
        }
        source = source.substring(0, end);

        let currentValue = 0;
        let currentBits = 0;
        // Estimate size: source.length * k / 8
        const buffer = new Uint8Array((source.length * k) >>> 3);
        let ptr = 0;

        for (let i = 0; i < source.length; i++) {
          const char = source.charCodeAt(i);
          const val = BASE_MAP[char];
          if (val === 255) return undefined;

          currentValue = (currentValue << k) | val;
          currentBits += k;

          if (currentBits >= 8) {
            currentBits -= 8;
            buffer[ptr++] = (currentValue >>> currentBits) & 0xff;
          }
        }
        return buffer;
      };

      const decode = (string: string): Uint8Array => {
        const buffer = decodeUnsafe(string);
        if (buffer) return buffer;
        throw new Error("Non-base" + BASE + " character");
      };

      return { encode, decodeUnsafe, decode };
    }

    // Standard Mode (Bitwise)
    const encode = (source: Uint8Array | ArrayBuffer | number[]): string => {
      if (source instanceof Uint8Array) {
      } else if (ArrayBuffer.isView(source)) {
        source = new Uint8Array(
          source.buffer,
          source.byteOffset,
          source.byteLength,
        );
      } else if (Array.isArray(source)) {
        source = Uint8Array.from(source);
      }
      if (!(source instanceof Uint8Array)) {
        throw new TypeError("Expected Uint8Array");
      }
      if (source.length === 0) {
        return "";
      }

      let zeroes = 0;
      let pbegin = 0;
      const pend = source.length;
      while (pbegin !== pend && source[pbegin] === 0) {
        pbegin++;
        zeroes++;
      }

      let str = LEADER.repeat(zeroes);
      if (pbegin === pend) return str;

      // Bitwise conversion
      let currentValue = 0;
      let currentBits = 0;
      const totalBits = (pend - pbegin) * 8;
      let remainder = totalBits % k;

      // Handling the initial alignment to the most significant bits
      // If total bits isn't divisible by k, the first digit uses 'remainder' bits
      if (remainder === 0) remainder = k; // effectively divisible, treating first k bits normally

      let seenNonZero = false;
      let firstChunk = true;

      for (let i = pbegin; i < pend; i++) {
        currentValue = (currentValue << 8) | source[i];
        currentBits += 8;

        while (currentBits >= k || (firstChunk && currentBits >= remainder)) {
          let bitsToExtract = k;
          if (firstChunk) {
            if (totalBits % k !== 0) {
              bitsToExtract = totalBits % k;
            }
            firstChunk = false;
          }

          const shift = currentBits - bitsToExtract;
          const digit = (currentValue >>> shift) & ((1 << bitsToExtract) - 1);
          currentBits -= bitsToExtract;

          if (seenNonZero || digit !== 0) {
            str += ALPHABET.charAt(digit);
            seenNonZero = true;
          }
        }
      }
      return str;
    };

    const decodeUnsafe = (source: string): Uint8Array | undefined => {
      if (typeof source !== "string") {
        throw new TypeError("Expected String");
      }
      if (source.length === 0) {
        return new Uint8Array();
      }

      let psz = 0;
      let zeroes = 0;
      while (source.charCodeAt(psz) === LEADER_CODE) {
        zeroes++;
        psz++;
      }

      // Accumulate bits
      // We must handle alignment.
      const length = source.length - psz;
      const totalBits = length * k;
      let currentBits = (8 - (totalBits % 8)) % 8; // align to byte boundary

      const result = new Uint8Array((totalBits + 7) >>> 3); // (totalBits + 7) / 8
      let rIdx = 0;

      let currentValue = 0;

      for (let i = psz; i < source.length; i++) {
        const char = source.charCodeAt(i);
        const val = BASE_MAP[char];
        if (val === 255) return;

        currentValue = (currentValue << k) | val;
        currentBits += k;

        if (currentBits >= 8) {
          const shift = currentBits - 8;
          result[rIdx++] = (currentValue >>> shift) & 0xff;
          currentBits -= 8;
          // Keep only the remaining bits to avoid overflow
          currentValue &= (1 << currentBits) - 1;
        }
      }

      // Skip leading zeroes in result buffer
      let skip = 0;
      while (skip < rIdx && result[skip] === 0) {
        skip++;
      }

      // Combine with zeroes
      const final = new Uint8Array(zeroes + (rIdx - skip));
      // zeroes are 0, so just copy result
      final.set(result.subarray(skip, rIdx), zeroes);
      return final;
    };

    const decode = (string: string): Uint8Array => {
      const buffer = decodeUnsafe(string);
      if (buffer) return buffer;
      throw new Error("Non-base" + BASE + " character");
    };

    return { encode, decodeUnsafe, decode };
  }

  const encode = (source: Uint8Array | ArrayBuffer | number[]): string => {
    if (source instanceof Uint8Array) {
    } else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(
        source.buffer,
        source.byteOffset,
        source.byteLength,
      );
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError("Expected Uint8Array");
    }
    if (source.length === 0) {
      return "";
    }
    // Skip & count leading zeroes.
    let zeroes = 0;
    let length = 0;
    let pbegin = 0;
    const pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    // Allocate enough space in big-endian base58 representation.
    const size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
    const b58 = new Uint8Array(size);
    // Process the bytes.
    while (pbegin !== pend) {
      let carry = source[pbegin];
      // Apply "b58 = b58 * 256 + ch".
      let i = 0;
      for (
        let it1 = size - 1;
        (carry !== 0 || i < length) && it1 !== -1;
        it1--, i++
      ) {
        carry += (b58[it1] << 8) >>> 0;
        b58[it1] = (carry % BASE) >>> 0;
        carry = (carry / BASE) >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length = i;
      pbegin++;
    }
    // Skip leading zeroes in base58 result.
    let it2 = size - length;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    // Translate the result into a string.
    let str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET.charAt(b58[it2]);
    }
    return str;
  };

  const decodeUnsafe = (source: string): Uint8Array | undefined => {
    if (typeof source !== "string") {
      throw new TypeError("Expected String");
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    let psz = 0;
    // Skip and count leading '1's.
    let zeroes = 0;
    let length = 0;
    while (source.charCodeAt(psz) === LEADER_CODE) {
      zeroes++;
      psz++;
    }
    // Allocate enough space in big-endian base256 representation.
    const size = ((source.length - psz) * FACTOR + 1) >>> 0; // log(58) / log(256), rounded up.
    let b256 = new Uint8Array(size);
    // Process the characters.
    for (; psz < source.length; psz++) {
      // Decode character
      let carry = BASE_MAP[source.charCodeAt(psz)];
      // Invalid character
      if (carry === 255) {
        return;
      }
      let i = 0;
      for (
        let it3 = size - 1;
        (carry !== 0 || i < length) && it3 !== -1;
        it3--, i++
      ) {
        carry += (BASE * b256[it3]) >>> 0;
        b256[it3] = (carry & 0xff) >>> 0;
        carry = (carry >> 8) >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length = i;
    }
    // Skip leading zeroes in b256.
    let it4 = size - length;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    let vch = new Uint8Array(zeroes + (size - it4));
    let j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch;
  };

  const decode = (string: string): Uint8Array => {
    const buffer = decodeUnsafe(string);
    if (buffer) {
      return buffer;
    }
    throw new Error("Non-base" + BASE + " character");
  };

  return {
    encode,
    decodeUnsafe,
    decode,
  };
};

export { base as default };
