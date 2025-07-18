declare module "@aigne/marked-terminal" {
  import type { MarkedExtension } from "marked";

  export function markedTerminal(options?: object, highlightOptions?: object): MarkedExtension;
}

declare module "@abtnode/util/*";
