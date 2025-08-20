import { describe, expect, test } from "bun:test";
import {
  decodeEncryptionKey,
  decrypt,
  encodeEncryptionKey,
  encrypt,
} from "../../../src/utils/aigne-hub/crypto.js";

describe("Encryption Functions", () => {
  describe("encodeEncryptionKey", () => {
    test("should encode encryption key correctly", () => {
      const key = "test-key-123";
      const encoded = encodeEncryptionKey(key);

      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe("string");
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("=");
    });

    test("should handle empty string", () => {
      const encoded = encodeEncryptionKey("");
      expect(encoded).toBe("");
    });

    test("should handle special characters", () => {
      const key = "test+key/with=special";
      const encoded = encodeEncryptionKey(key);

      expect(encoded).toBeDefined();
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("=");
    });
  });

  describe("decodeEncryptionKey", () => {
    test("should decode encryption key correctly", () => {
      const originalKey = "test-key-123";
      const encoded = encodeEncryptionKey(originalKey);
      const decoded = decodeEncryptionKey(encoded);

      expect(decoded).toBeInstanceOf(Uint8Array);
      expect(Buffer.from(decoded).toString()).toBe(originalKey);
    });

    test("should handle empty string", () => {
      const decoded = decodeEncryptionKey("");
      expect(decoded).toBeInstanceOf(Uint8Array);
      expect(decoded.length).toBe(0);
    });

    test("should round-trip encode and decode", () => {
      const testKeys = [
        "simple-key",
        "key-with-special+chars",
        "key/with/path",
        "key=with=equals",
        "key+with+plus+and/slash/and=equals",
        "1234567890",
        "!@#$%^&*()",
        "中文测试",
        "🚀 emoji test 🎉",
      ];

      for (const key of testKeys) {
        const encoded = encodeEncryptionKey(key);
        const decoded = decodeEncryptionKey(encoded);
        expect(Buffer.from(decoded).toString()).toBe(key);
      }
    });
  });

  describe("encrypt and decrypt", () => {
    test("should encrypt and decrypt message correctly", () => {
      const message = "Hello, World!";
      const salt = "test-salt";
      const iv = "test-iv";

      const encrypted = encrypt(message, salt, iv);
      const decrypted = decrypt(encrypted, salt, iv);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe("string");
      expect(encrypted).not.toBe(message);
      expect(decrypted).toBe(message);
    });

    test("should handle empty message", () => {
      const message = "";
      const salt = "test-salt";
      const iv = "test-iv";

      const encrypted = encrypt(message, salt, iv);
      const decrypted = decrypt(encrypted, salt, iv);

      expect(encrypted).toBeDefined();
      expect(decrypted).toBe(message);
    });

    test("should handle special characters in message", () => {
      const message = "Hello! @#$%^&*() 中文 🚀";
      const salt = "test-salt";
      const iv = "test-iv";

      const encrypted = encrypt(message, salt, iv);
      const decrypted = decrypt(encrypted, salt, iv);

      expect(decrypted).toBe(message);
    });

    test("should handle different salt and iv combinations", () => {
      const message = "Test message";
      const testCases = [
        { salt: "salt1", iv: "iv1" },
        { salt: "salt2", iv: "iv2" },
        { salt: "long-salt-value", iv: "long-iv-value" },
        { salt: "special+chars", iv: "special/chars" },
        { salt: "中文salt", iv: "中文iv" },
      ];

      for (const { salt, iv } of testCases) {
        const encrypted = encrypt(message, salt, iv);
        const decrypted = decrypt(encrypted, salt, iv);
        expect(decrypted).toBe(message);
      }
    });

    test("should produce different encrypted results for same message with different salt/iv", () => {
      const message = "Same message";
      const encrypted1 = encrypt(message, "salt1", "iv1");
      const encrypted2 = encrypt(message, "salt2", "iv2");
      const encrypted3 = encrypt(message, "salt1", "iv2");

      expect(encrypted1).not.toBe(encrypted2);
      expect(encrypted1).not.toBe(encrypted3);
      expect(encrypted2).not.toBe(encrypted3);
    });

    test("should handle large messages", () => {
      const message = `${"A".repeat(1000)}Large·message·with·repeated·characters`;
      const salt = "test-salt";
      const iv = "test-iv";

      const encrypted = encrypt(message, salt, iv);
      const decrypted = decrypt(encrypted, salt, iv);

      expect(decrypted).toBe(message);
    });

    test("should handle unicode characters", () => {
      const messages = [
        "Hello 世界",
        "Привет мир",
        "こんにちは世界",
        "안녕하세요 세계",
        "مرحبا بالعالم",
        "🚀 Rocket emoji 🎉",
        "Mixed: Hello 世界 🚀 123 !@#",
      ];

      const salt = "test-salt";
      const iv = "test-iv";

      for (const message of messages) {
        const encrypted = encrypt(message, salt, iv);
        const decrypted = decrypt(encrypted, salt, iv);
        expect(decrypted).toBe(message);
      }
    });
  });

  describe("Integration tests", () => {
    test("should work with real-world scenario", () => {
      // Simulate a real-world scenario where we encode a key, then use it for encryption
      const originalKey = "my-secret-api-key-12345";
      const encodedKey = encodeEncryptionKey(originalKey);
      const decodedKey = decodeEncryptionKey(encodedKey);

      const message = "Sensitive data that needs encryption";
      const salt = "application-salt";
      const iv = "session-iv";

      const encrypted = encrypt(message, salt, iv);
      const decrypted = decrypt(encrypted, salt, iv);

      expect(Buffer.from(decodedKey).toString()).toBe(originalKey);
      expect(decrypted).toBe(message);
    });

    test("should handle multiple encryption/decryption cycles", () => {
      const message = "Original message";
      const salt = "test-salt";
      const iv = "test-iv";

      let currentMessage = message;

      // Perform multiple encryption/decryption cycles
      for (let i = 0; i < 5; i++) {
        const encrypted = encrypt(currentMessage, salt, iv);
        const decrypted = decrypt(encrypted, salt, iv);
        expect(decrypted).toBe(currentMessage);
        currentMessage = encrypted; // Use encrypted as input for next cycle
      }
    });
  });
});
