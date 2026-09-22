// Reverse PowerShell 5.1's UTF-8 -> cp1252 mis-decode.
// Current file bytes = original UTF-8 bytes, each byte interpreted as cp1252
// and then re-encoded as UTF-8. So: take the text, map each char back to its
// cp1252 byte, then decode those bytes as UTF-8.
const fs = require("fs");

const cp1252 = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};
const reverse = {};
for (const [uni, byte] of Object.entries(cp1252)) reverse[Number(uni)] = byte;

const path = process.argv[2];
let text = fs.readFileSync(path, "utf8");
const bytes = [];
for (const ch of text) {
  const code = ch.codePointAt(0);
  if (code <= 0xff) {
    bytes.push(code);
  } else if (reverse[code] !== undefined) {
    bytes.push(reverse[code]);
  } else {
    // Not representable in cp1252: re-encode as UTF-8 (this char was fine).
    const buf = Buffer.from(ch, "utf8");
    for (const b of buf) bytes.push(b);
  }
}
const fixed = Buffer.from(bytes).toString("utf8");
fs.writeFileSync(path, fixed, "utf8");
console.log("rewrote", path);
const check = fs.readFileSync(path, "utf8");
const idx = check.indexOf("Timed test");
console.log("check:", JSON.stringify(check.slice(idx - 30, idx + 12)));
const moj = (check.match(/\u00c3[\u0080-\u00bf]/g) || []).length;
console.log("remaining \u00c3-prefixed sequences:", moj);
