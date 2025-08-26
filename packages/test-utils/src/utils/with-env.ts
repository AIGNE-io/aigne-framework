export function withEnv(env: Record<string, string>): {
  [Symbol.dispose]: () => void;
} {
  const originalEnv = { ...process.env };
  process.env = { ...process.env, ...env };

  return {
    [Symbol.dispose]: () => {
      process.env = originalEnv;
    },
  };
}
