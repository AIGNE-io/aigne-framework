import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";

/**
 * Wait for file size to stabilize, ensuring the file download is complete.
 *
 * @param filePath - The path to the file to check
 * @param options - Configuration options
 * @param options.checkInterval - Check interval in milliseconds (default: 500ms)
 * @param options.stableCount - Number of consecutive checks with same size to consider stable (default: 3)
 * @param options.timeout - Timeout in milliseconds (default: 60000ms)
 * @throws Error when timeout is reached
 */
export async function waitFileSizeStable(
  filePath: string,
  options?: {
    checkInterval?: number;
    stableCount?: number;
    timeout?: number;
  },
): Promise<void> {
  const checkInterval = options?.checkInterval ?? 500;
  const requiredStableCount = options?.stableCount ?? 3;
  const timeout = options?.timeout ?? 60000;

  const startTime = Date.now();
  let previousSize = 0;
  let stableCount = 0;

  while (stableCount < requiredStableCount) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for file to stabilize: ${filePath}`);
    }

    await new Promise((resolve) => setTimeout(resolve, checkInterval));

    const stats = await nodejs.fs.stat(filePath);
    const currentSize = stats.size;

    if (currentSize === previousSize && currentSize > 0) {
      stableCount++;
    } else {
      stableCount = 0;
      previousSize = currentSize;
    }
  }
}
