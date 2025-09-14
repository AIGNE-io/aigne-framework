export * from "./reexport.js";

export interface InitDatabaseOptions {
  url?: string;
  wal?: boolean;
}

export async function initDatabase(options?: InitDatabaseOptions) {
  if (typeof window === "undefined") {
    return import("./index.node.js").then((m) => m.initDatabase(options));
  }
  return import("./index.browser.js").then((m) => m.initDatabase(options));
}
