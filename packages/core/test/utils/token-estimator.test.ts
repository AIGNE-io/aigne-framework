import { expect, test } from "bun:test";
import { estimateTokens } from "@aigne/core/utils/token-estimator.js";

test("estimateTokens - empty string", () => {
  expect(estimateTokens("")).toBe(0);
});

test("estimateTokens - English only", () => {
  const text = "Hello world";
  const tokens = estimateTokens(text);

  // 2 words * 0.75 = 1.5 tokens, plus 1 space / 4 = 0.25, total ~1.75, ceil to 2
  expect(tokens).toBeGreaterThan(0);
  expect(tokens).toBeLessThan(10);
});

test("estimateTokens - Chinese only", () => {
  const text = "你好世界";
  const tokens = estimateTokens(text);

  // 4 characters / 1.5 = 2.67, ceil to 3
  expect(tokens).toBe(3);
});

test("estimateTokens - mixed Chinese and English", () => {
  const text = "Hello 世界";
  const tokens = estimateTokens(text);

  // 1 word * 0.75 = 0.75, 2 Chinese chars / 1.5 = 1.33, 1 space / 4 = 0.25
  // Total ~2.33, ceil to 3
  expect(tokens).toBeGreaterThan(0);
  expect(tokens).toBeLessThan(10);
});

test("estimateTokens - English sentence", () => {
  const text = "The quick brown fox jumps over the lazy dog.";
  const tokens = estimateTokens(text);

  // 9 words * 0.75 = 6.75, 8 spaces + 1 punctuation = 9
  // Total ~15.75, ceil to 16
  expect(tokens).toBeGreaterThan(10);
  expect(tokens).toBeLessThan(20);
});

test("estimateTokens - Chinese sentence", () => {
  const text = "这是一个测试句子，包含标点符号。";
  const tokens = estimateTokens(text);

  // 15 Chinese characters / 1.5 = 10, plus punctuation
  expect(tokens).toBeGreaterThan(8);
  expect(tokens).toBeLessThan(20);
});

test("estimateTokens - code snippet", () => {
  const text = 'function hello() { return "world"; }';
  const tokens = estimateTokens(text);

  // Should handle mixed alphanumeric, symbols, and spaces
  expect(tokens).toBeGreaterThan(0);
  expect(tokens).toBeLessThan(50);
});

test("estimateTokens - numbers and punctuation", () => {
  const text = "123 + 456 = 579!";
  const tokens = estimateTokens(text);

  // Numbers, operators, spaces treated as "other" (4 chars per token)
  expect(tokens).toBeGreaterThan(0);
  expect(tokens).toBeLessThan(20);
});

test("estimateTokens - Japanese text", () => {
  const text = "こんにちは世界";
  const tokens = estimateTokens(text);

  // Japanese Hiragana + Kanji, treated as Chinese (1.5 chars per token)
  // 7 characters / 1.5 = 4.67, ceil to 5
  expect(tokens).toBe(5);
});

test("estimateTokens - long English text", () => {
  const text =
    "This is a longer piece of text that contains multiple sentences. " +
    "It should be tokenized based on the number of words and other characters. " +
    "The estimation should be reasonably accurate for practical use.";
  const tokens = estimateTokens(text);

  // Rough estimate: ~30 words * 0.75 = 22.5, plus spaces/punctuation (each char = 1 token)
  expect(tokens).toBeGreaterThan(40);
  expect(tokens).toBeLessThan(80);
});

test("estimateTokens - JSON object", () => {
  const obj = {
    name: "测试",
    age: 25,
    active: true,
  };
  const text = JSON.stringify(obj);
  const tokens = estimateTokens(text);

  // Should handle JSON structure with mixed content
  expect(tokens).toBeGreaterThan(0);
  expect(tokens).toBeLessThan(30);
});

test("estimateTokens - special characters", () => {
  const text = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
  const tokens = estimateTokens(text);

  // All special characters, treated as remaining chars (1 char = 1 token)
  // 29 chars = 29 tokens
  expect(tokens).toBe(29);
});

test("estimateTokens - whitespace only", () => {
  const text = "   \n\t  ";
  const tokens = estimateTokens(text);

  // Whitespace treated as remaining chars (1 char = 1 token)
  // 7 chars = 7 tokens
  expect(tokens).toBe(7);
});

test("estimateTokens - mixed content paragraph", () => {
  const text =
    "The TokenEstimator类可以估算中英文混合文本的token数量。" +
    "It uses正则表达式to identify different character types.";
  const tokens = estimateTokens(text);

  // Complex mix of English words, Chinese characters, and symbols
  expect(tokens).toBeGreaterThan(10);
  expect(tokens).toBeLessThan(50);
});
