import { fetchEventSource } from "@microsoft/fetch-event-source";
import { joinURL } from "ufo";
import { origin } from "./index.ts";

export async function watchSSE({
  signal,
}: {
  signal?: AbortSignal | null;
}) {
  const url = joinURL(origin, "/api/sse");

  return new ReadableStream<{ type: "event"; data: any } | { type: "error"; message: string }>({
    async start(controller) {
      await fetchEventSource(url, {
        signal,
        method: "GET",
        onmessage(e) {
          const data = JSON.parse(e.data);
          controller.enqueue(data);
        },
        onerror(err) {
          throw err;
        },
        onclose() {
          controller.close();
        },
      });
    },
  });
}
