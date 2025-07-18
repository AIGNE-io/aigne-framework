import path from "node:path";
import { publishDocs } from "@aigne/publish-docs";

if (!process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN) {
  throw new Error("DOC_DISCUSS_KIT_ACCESS_TOKEN is not set");
}
if (!process.env.DOC_DISCUSS_KIT_URL) {
  throw new Error("DOC_DISCUSS_KIT_URL is not set");
}
if (!process.env.DOC_DISCUSS_KIT_BOARD_ID) {
  throw new Error("DOC_DISCUSS_KIT_BOARD_ID is not set");
}

const { success, error } = await publishDocs({
  sidebarPath: path.join(process.cwd(), `${process.env.DOC_ROOT_DIR || "docs"}/_sidebar.md`),
  accessToken: process.env.DOC_DISCUSS_KIT_ACCESS_TOKEN,
  appUrl: process.env.DOC_DISCUSS_KIT_URL,
  boardId: process.env.DOC_DISCUSS_KIT_BOARD_ID,
  slugWithoutExt: false,
});

if (!success) {
  console.error("Failed to publish docs:", error);
  process.exit(1);
}
