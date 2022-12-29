declare interface baseX {
  encode(source: Uint8Array | ArrayBuffer):string
  decode(source: string):Uint8Array
  decodeUnsafe(source: string):Uint8Array | undefined
}

declare module '@vandeurenglenn/base-x' {
  export default function (ALPHABET: string):baseX
}