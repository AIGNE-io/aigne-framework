import crypto from "node:crypto";
import AES from "crypto-js/aes.js";
import encBase64 from "crypto-js/enc-base64.js";
import encHex from "crypto-js/enc-hex.js";
import encLatin1 from "crypto-js/enc-latin1.js";
import encUtf8 from "crypto-js/enc-utf8.js";
import encUtf16 from "crypto-js/enc-utf16.js";

const encoders: { [index: string]: typeof encLatin1 } = {
  latin1: encLatin1,
  utf8: encUtf8,
  hex: encHex,
  utf16: encUtf16,
  base64: encBase64,
};

class AesCrypter {
  encrypt(message: string | object, secret: string) {
    const text = typeof message === "string" ? message : JSON.stringify(message);
    return AES.encrypt(text, secret).toString();
  }

  decrypt(cipher: string, secret: string, outputEncoding = "utf8") {
    return AES.decrypt(cipher, secret).toString(encoders[outputEncoding]);
  }
}

const aes = new AesCrypter();

export const decrypt = (m: string, s: string, i: string) =>
  aes.decrypt(m, crypto.pbkdf2Sync(i, s, 256, 32, "sha512").toString("hex"));
export const encrypt = (m: string, s: string, i: string) =>
  aes.encrypt(m, crypto.pbkdf2Sync(i, s, 256, 32, "sha512").toString("hex"));

const escapeFn = (str: string) => str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
const unescapeFn = (str: string) =>
  (str + "===".slice((str.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/");
export const encodeEncryptionKey = (key: string) => escapeFn(Buffer.from(key).toString("base64"));
export const decodeEncryptionKey = (str: string) =>
  new Uint8Array(Buffer.from(unescapeFn(str), "base64"));
