import { Spinner } from "@aigne/listr2";

export async function withSpinner<T>(message: string, fn: () => Promise<T>): Promise<T> {
  const spinner = new Spinner();
  spinner.start(() => {
    process.stdout.write(`\r\x1b[K${spinner.fetch()} ${message}`);
  });

  try {
    return await fn();
  } finally {
    spinner.stop();
    process.stdout.write("\r\x1b[K"); // Clear the spinner line
  }
}
