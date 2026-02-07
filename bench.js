import base from "./index.js";
import fs from "fs";
import { performance } from "perf_hooks";

// Test Data
const data = new Uint8Array(32); // 32 bytes like a hash
for (let i = 0; i < 32; i++) data[i] = Math.floor(Math.random() * 256);

// --- Base58 (Original) ---
const ALPHABET_58 =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = base(ALPHABET_58);
const encoded58 = bs58.encode(data);

// --- Base16 (Pow2 Optimized) ---
const ALPHABET_16 = "0123456789ABCDEF";
const bs16 = base(ALPHABET_16);
const encoded16 = bs16.encode(data);

// --- Base32 (Pow2 Optimized) ---
const ALPHABET_32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const bs32 = base(ALPHABET_32);
const encoded32 = bs32.encode(data);

// --- Base64 (Pow2 Optimized) ---
const ALPHABET_64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const bs64 = base(ALPHABET_64);
const encoded64 = bs64.encode(data);

console.log("Benchmarking...");
console.log(`Node Version: ${process.version}`);

const results = [];

function runBenchmark(name, fn) {
  const start = performance.now();
  let count = 0;
  const duration = 1000; // run for 1 second
  while (performance.now() - start < duration) {
    fn();
    count++;
  }
  const actualDuration = performance.now() - start;
  const opsPerSec = Math.floor((count / actualDuration) * 1000);
  const result = `${name} x ${opsPerSec.toLocaleString()} ops/sec`;
  console.log(result);
  results.push(result);
}

// Base58
runBenchmark("base-x (58) encode", () => bs58.encode(data));
runBenchmark("base-x (58) decode", () => bs58.decode(encoded58));

// Base16
runBenchmark("base-x (16) encode", () => bs16.encode(data));
runBenchmark("base-x (16) decode", () => bs16.decode(encoded16));

// Base32
runBenchmark("base-x (32) encode", () => bs32.encode(data));
runBenchmark("base-x (32) decode", () => bs32.decode(encoded32));

// Base64
runBenchmark("base-x (64) encode", () => bs64.encode(data));
runBenchmark("base-x (64) decode", () => bs64.decode(encoded64));

// Save history
const content = `\n### ${new Date().toISOString()} (Native)\n\`\`\`\n${results.join(
  "\n",
)}\n\`\`\`\n`;
fs.appendFileSync("bench-history.md", content);
