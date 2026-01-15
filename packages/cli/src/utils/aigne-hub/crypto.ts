import crypto from "node:crypto";
import CryptoJS from "crypto-js";

const encoders: { [index: string]: typeof CryptoJS.enc.Latin1 } = {
  latin1: CryptoJS.enc.Latin1,
  utf8: CryptoJS.enc.Utf8,
  hex: CryptoJS.enc.Hex,
  utf16: CryptoJS.enc.Utf16,
  base64: CryptoJS.enc.Base64,
};

class AesCrypter {
  encrypt(message: string | object, secret: string) {
    const text = typeof message === "string" ? message : JSON.stringify(message);
    return CryptoJS.AES.encrypt(text, secret).toString();
  }

  decrypt(cipher: string, secret: string, outputEncoding = "utf8") {
    return CryptoJS.AES.decrypt(cipher, secret).toString(encoders[outputEncoding]);
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
