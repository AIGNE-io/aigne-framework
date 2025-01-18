export async function checkFetchResponse(result: Response) {
  if (!result.ok) {
    let message: string | undefined;

    try {
      const json: any = await result.json();
      const msg = json.error?.message || json.message;
      if (msg && typeof msg === "string") {
        message = msg;
      }
    } catch {
      // ignore
    }

    throw new Error(
      message ||
        `Failed to fetch url ${result.url} with status ${result.status}`,
    );
  }

  return result;
}
