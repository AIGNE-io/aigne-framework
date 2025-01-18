export default async function retry<T>(
  fn: () => Promise<T> | T,
  retries: number,
): Promise<T> {
  let i = 0;

  for (;;) {
    try {
      return await fn();
    } catch (error) {
      if (i < retries) {
        i++;
      } else {
        throw error;
      }
    }
  }
}
