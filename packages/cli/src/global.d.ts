declare module "marked-terminal" {
  import type { MarkedExtension } from "marked";

  export function markedTerminal(options?: object, highlightOptions?: object): MarkedExtension;
}
