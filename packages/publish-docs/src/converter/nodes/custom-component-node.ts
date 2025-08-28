import {
  DecoratorBlockNode,
  type SerializedDecoratorBlockNode,
} from "@lexical/react/LexicalDecoratorBlockNode";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  ElementFormatType,
  LexicalNode,
  NodeKey,
  Spread,
} from "lexical";

const NODE_TYPE = "x-component";

interface CustomComponentData {
  component: string;
  properties?: Record<string, unknown>;
}

export type SerializedCustomComponentNode = Spread<
  {
    type: typeof NODE_TYPE;
    data: CustomComponentData;
  },
  SerializedDecoratorBlockNode
>;

function isCustomComponent(domNode: HTMLElement): boolean {
  return domNode.tagName.toLowerCase().startsWith("x-");
}

function getComponentName(domNode: HTMLElement): string {
  if (!isCustomComponent(domNode)) {
    throw new Error(`Invalid component name: ${domNode.tagName.toLowerCase()}`);
  }
  return domNode.tagName.toLowerCase().slice(2);
}

function domToComponentProperties(domNode: HTMLElement): Record<string, unknown> {
  const properties: Record<string, unknown> = {
    component: getComponentName(domNode),
    ...domNode.dataset,
  };
  const { children } = domNode;
  const hasChildren = Array.from(children).some((child) => isCustomComponent(child as HTMLElement));
  if (hasChildren) {
    properties.children = Array.from(children).map((child) => {
      const childProperties = domToComponentProperties(child as HTMLElement);
      return { component: childProperties.component, properties: childProperties };
    });
  } else {
    properties.body = domNode.textContent?.trim() || "";
  }
  return properties;
}

function convertCustomComponentElement(domNode: HTMLElement): null | DOMConversionOutput {
  const component = getComponentName(domNode);
  try {
    if (component) {
      const node = $createCustomComponentNode({
        component,
        properties: domToComponentProperties(domNode),
      });
      return { node };
    }
  } catch (e) {
    console.warn(`Failed to parse: ${component}`, e);
  }
  return null;
}

export class CustomComponentNode extends DecoratorBlockNode {
  __data: CustomComponentData;

  static override getType(): string {
    return NODE_TYPE;
  }

  static override clone(node: CustomComponentNode): CustomComponentNode {
    return new CustomComponentNode(node.__data, node.__format, node.__key);
  }

  constructor(data: CustomComponentData, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__data = { ...data };
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    const { body, ...rest } = this.__data.properties || {};
    if (body) {
      element.textContent = body as string;
    }
    Object.entries(rest).forEach(([key, value]) => {
      element.setAttribute(`data-${key}`, value as string);
    });
    return { element };
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      "x-card": () => ({ conversion: convertCustomComponentElement, priority: 1 }),
      "x-cards": () => ({ conversion: convertCustomComponentElement, priority: 1 }),
      "x-code-group": () => ({ conversion: convertCustomComponentElement, priority: 1 }),
      "x-steps": () => ({ conversion: convertCustomComponentElement, priority: 1 }),
    };
  }

  static override importJSON(serializedNode: SerializedCustomComponentNode): CustomComponentNode {
    const node = $createCustomComponentNode(serializedNode.data);
    return node;
  }

  override exportJSON(): SerializedCustomComponentNode {
    return {
      ...super.exportJSON(),
      type: NODE_TYPE,
      data: this.__data,
      version: 1,
    };
  }

  getData(): CustomComponentData {
    return this.__data;
  }

  setData(data: CustomComponentData): void {
    const writable = this.getWritable();
    writable.__data = data;
  }

  override isInline(): false {
    return false;
  }
}

export function $createCustomComponentNode(data: CustomComponentData): CustomComponentNode {
  const customComponentNode = new CustomComponentNode(data);
  return customComponentNode;
}

export function $isCustomComponentNode(
  node: LexicalNode | null | undefined,
): node is CustomComponentNode {
  return node instanceof CustomComponentNode;
}
