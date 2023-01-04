/**
 *  string containging only given ALPHABET letters/numbers
 */
type baseString = string;
type baseX = {
    encode: (uint8Array: Uint8Array) => baseString;
    decode: (string: baseString) => Uint8Array;
    decodeUnsafe: (string: baseString) => Uint8Array;
};
declare const base: (ALPHABET: string) => baseX;
export { base as default };
