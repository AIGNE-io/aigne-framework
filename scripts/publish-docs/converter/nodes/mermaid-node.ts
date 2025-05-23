import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

import { DecoratorNode } from "lexical";

// Define JSX namespace for headless environment
declare namespace JSX {
  interface Element {
    type: string;
    props: Record<string, unknown>;
    children: unknown[];
  }
}

export interface MermaidPayload {
  code: string;
  theme?: string;
  mode?: string;
  key?: NodeKey;
}

export type SerializedMermaidNode = Spread<
  {
    code: string;
    theme?: string;
    mode?: string;
    type: "mermaid";
    version: 1;
  },
  SerializedLexicalNode
>;

function convertMermaidElement(domNode: Node): null | DOMConversionOutput {
  if (domNode && (domNode as HTMLElement).classList?.contains("mermaid")) {
    const code = domNode.textContent || "";
    const node = $createMermaidNode({ code });
    return { node };
  }
  return null;
}

export class MermaidNode extends DecoratorNode<JSX.Element> {
  __code: string;
  __theme?: string;
  __mode?: string;

  static getType(): string {
    return "mermaid";
  }

  static clone(node: MermaidNode): MermaidNode {
    return new MermaidNode(node.__code, node.__theme, node.__mode, node.__key);
  }

  static importJSON(serializedNode: SerializedMermaidNode): MermaidNode {
    const { code, theme, mode } = serializedNode;
    return $createMermaidNode({ code, theme, mode });
  }

  exportJSON(): SerializedMermaidNode {
    return {
      code: this.__code,
      theme: this.__theme,
      mode: this.__mode,
      type: "mermaid",
      version: 1,
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      pre: (domNode: Node) => {
        if ((domNode as HTMLElement).classList?.contains("mermaid")) {
          return { conversion: convertMermaidElement, priority: 0 };
        }
        return null;
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("pre");
    element.className = "mermaid";
    element.textContent = this.__code;
    return { element };
  }

  constructor(code: string, theme?: string, mode?: string, key?: NodeKey) {
    super(key);
    this.__code = code;
    this.__theme = theme;
    this.__mode = mode;
  }

  getCode(): string {
    return this.__code;
  }

  setCode(code: string): void {
    const writable = this.getWritable();
    writable.__code = code;
  }

  getTheme(): string | undefined {
    return this.__theme;
  }

  setTheme(theme: string): void {
    const writable = this.getWritable();
    writable.__theme = theme;
  }

  getMode(): string | undefined {
    return this.__mode;
  }

  setMode(mode: string): void {
    const writable = this.getWritable();
    writable.__mode = mode;
  }

  createDOM(): HTMLElement {
    const pre = document.createElement("pre");
    pre.className = "mermaid";
    return pre;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    return {
      type: "pre",
      props: {
        className: "mermaid",
      },
      children: [],
    };
  }
}

export function $createMermaidNode({ code, theme, mode, key }: MermaidPayload): MermaidNode {
  return new MermaidNode(code, theme, mode, key);
}

export function $isMermaidNode(node: LexicalNode | null | undefined): node is MermaidNode {
  return node instanceof MermaidNode;
}
