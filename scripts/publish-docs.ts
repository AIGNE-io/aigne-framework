import path from "node:path";
import { publishDocs } from "@aigne/publish-docs";

publishDocs({
  sidebarPath: path.join(process.cwd(), "docs/_sidebar.md"),
});
