import crypto from "node:crypto";
import { AesCrypter } from "@ocap/mcrypto/lib/crypter/aes-legacy.js";

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
