import base from "./index.js";
import test from "node:test";
import assert from "assert";
const baseIon = base("ion");

const uint8Array = new TextEncoder().encode("hi hello, hi");
const bsI = baseIon.encode(uint8Array);
const hi = baseIon.decode(bsI);
const string = new TextDecoder().decode(hi);

test("base-x encoding/decoding", () => {
  assert.strictEqual(string, "hi hello, hi");
});
