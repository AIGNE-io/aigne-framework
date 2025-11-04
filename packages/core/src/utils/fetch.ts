const TIMEOUT = (process.env.TIMEOUT && parseInt(process.env.TIMEOUT, 10)) || 8e3; // default timeout 8 seconds

export async function fetch(
  input: RequestInfo,
  init?: RequestInit & { timeout?: number },
): Promise<Response> {
  const url =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  const timeout = init?.timeout || TIMEOUT;

  const controller = timeout ? new AbortController() : undefined;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeout) : undefined;

  try {
    const response = await globalThis
      .fetch(input, {
        ...init,
        signal: controller?.signal,
      })
      .catch((error) => {
        error.message = `Fetch ${url} error: ${error.message}`;
        return Promise.reject(error);
      });

    // Clear the timeout if the fetch completes successfully
    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Fetch ${url} error: ${response.status} ${response.statusText} ${text}`);
    }

    response.json = () =>
      response.json().catch((error) => {
        error.message = `Parse JSON from ${url} error: ${error.message}`;
        return Promise.reject(error);
      });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
