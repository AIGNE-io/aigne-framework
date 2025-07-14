import { expect, test } from 'bun:test';
import { DefaultMemoryStorage } from '../../src/adapter/default-memory-storage/index.js';
import { AIGNE } from '@aigne/core';

test('DefaultMemoryStorage should search by fts', async () => {
  const context = new AIGNE().newContext();

  const storage = new DefaultMemoryStorage({
    enableFTS: true,
  });
  await storage.create(
    { content: { input: '我喜欢红色', output: '嗯，红色很不错' } },
    { context }
  );
  await storage.create(
    { content: { input: '我讨厌绿色', output: '绿色真的很糟糕' } },
    { context }
  );

  const { result: result1 } = await storage.search(
    { search: '绿色', limit: 10 },
    { context }
  );
  expect(result1).toMatchSnapshot(
    new Array(result1.length).fill(0).map(() => ({
      id: expect.any(String),
      createdAt: expect.any(String),
    }))
  );

  const { result: result2 } = await storage.search(
    { search: JSON.stringify({ message: '绿色' }), limit: 10 },
    { context }
  );
  expect(result2).toMatchSnapshot(
    new Array(result1.length).fill(0).map(() => ({
      id: expect.any(String),
      createdAt: expect.any(String),
    }))
  );
});
