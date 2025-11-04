const TIMEOUT = (process.env.TIMEOUT && parseInt(process.env.TIMEOUT, 10)) || 8e3; // default timeout 8 seconds

export async function fetch(
  input: RequestInfo,
  init?: RequestInit & { timeout?: number; skipResponseCheck?: boolean },
): Promise<Response> {
  const url =
    typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  const timeout = init?.timeout || TIMEOUT;

  const controller = timeout ? new AbortController() : undefined;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(new Error(`Timeout after ${timeout}ms`)), timeout)
    : undefined;

  try {
    const response = await globalThis
      .fetch(input, {
        ...init,
        signal: controller?.signal,
      })
      .catch((error) => {
        throw new Error(`Fetch ${url} error: ${error.message}`);
      });

    // Clear the timeout if the fetch completes successfully
    clearTimeout(timeoutId);

    if (!init?.skipResponseCheck && !response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Fetch ${url} error: ${response.status} ${response.statusText} ${text}`);
    }

    const json = response.json.bind(response);

    response.json = () =>
      json().catch((error) => {
        throw new Error(`Parse JSON from ${url} error: ${error.message}`);
      });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
