import { fetchEventSource } from "@microsoft/fetch-event-source";
import { joinURL } from "ufo";

export async function watchSSE({
  signal,
}: {
  signal?: AbortSignal | null;
}) {
  const origin =
    process.env.NODE_ENV === "development" ? "http://localhost:7890" : window.location.origin;
  const url = joinURL(origin, "/sse");

  return new ReadableStream<
    | {
        type: "change";
        documentId: string;
        embeddingStatus: string;
        embeddingEndAt?: Date;
        embeddingStartAt?: Date;
      }
    | {
        type: "complete";
        documentId: string;
        embeddingStatus: string;
        embeddingEndAt?: Date;
        embeddingStartAt?: Date;
      }
    | { type: "event"; documentId: string }
    | { type: "error"; documentId: string; embeddingStatus: string; message: string }
  >({
    async start(controller) {
      await fetchEventSource(url, {
        signal,
        method: "GET",
        onmessage(e) {
          const data = JSON.parse(e.data);
          controller.enqueue({ ...data, type: e.event });
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
