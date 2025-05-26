// ported from: https://github.com/blocklet/discuss-kit/blob/main/packages/editor/src/main/nodes/ImageNode.tsx
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from "lexical";

import { DecoratorNode, createEditor } from "lexical";

// Define JSX namespace for headless environment
declare namespace JSX {
  interface Element {
    type: string;
    props: Record<string, unknown>;
    children: unknown[];
  }
}

export type ImageSizeMode = "small" | "best-fit" | "original";

export interface ImagePayload {
  file?: File;
  altText: string;
  caption?: LexicalEditor;
  height?: number;
  key?: NodeKey;
  maxWidth?: number;
  showCaption?: boolean;
  src?: string;
  width?: number;
  captionsEnabled?: boolean;
  markerState?: string;
  frame?: string;
  sizeMode?: ImageSizeMode;
}

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode) {
    const { alt: altText, src } = domNode as HTMLImageElement;
    const node = $createImageNode({ altText, src });
    return { node };
  }
  return null;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    caption: SerializedEditor;
    height?: number;
    maxWidth: number;
    showCaption: boolean;
    src?: string;
    width?: number;
    markerState?: string;
    frame?: string;
    sizeMode?: ImageSizeMode;
    type: "image";
    version: 1;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  file?: File;

  __src?: string;

  __altText: string;

  __width: "inherit" | number;

  __height: "inherit" | number;

  __maxWidth: number;

  __showCaption: boolean;

  __caption: LexicalEditor;

  __markerState?: string;

  __frame?: string;

  __sizeMode?: ImageSizeMode;

  // Captions cannot yet be used within editor cells
  __captionsEnabled: boolean;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__captionsEnabled,
      node.__key,
      node.file,
      node.__markerState,
      node.__frame,
      node.__sizeMode,
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const {
      altText,
      height,
      width,
      maxWidth,
      caption,
      src,
      showCaption,
      markerState,
      frame,
      sizeMode,
    } = serializedNode;
    const node = $createImageNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
      markerState,
      frame,
      sizeMode,
    });
    const nestedEditor = node.__caption;
    const editorState = nestedEditor.parseEditorState(caption.editorState);
    if (!editorState.isEmpty()) {
      nestedEditor.setEditorState(editorState);
    }
    return node;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src || "");
    element.setAttribute("alt", this.__altText);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({ conversion: convertImageElement, priority: 0 }),
    };
  }

  constructor(
    src: string | undefined,
    altText: string,
    maxWidth: number,
    width?: "inherit" | number,
    height?: "inherit" | number,
    showCaption?: boolean,
    caption?: LexicalEditor,
    captionsEnabled?: boolean,
    key?: NodeKey,
    file?: File,
    markerState?: string,
    frame?: string,
    sizeMode?: ImageSizeMode,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__maxWidth = maxWidth;
    this.__width = width || "inherit";
    this.__height = height || "inherit";
    this.__showCaption = showCaption || false;
    this.__caption = caption || createEditor();
    this.__captionsEnabled = captionsEnabled || captionsEnabled === undefined;
    this.file = file;
    this.__markerState = markerState;
    this.__frame = frame;
    // default to original size mode
    this.__sizeMode = sizeMode || "original";
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption.toJSON(),
      height: this.__height === "inherit" ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: "image",
      version: 1,
      width: this.__width === "inherit" ? 0 : this.__width,
      markerState: this.__markerState,
      frame: this.__frame,
      sizeMode: this.__sizeMode,
    };
  }

  setWidthAndHeight(width: "inherit" | number, height: "inherit" | number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable();
    writable.__showCaption = showCaption;
  }

  setMarkerState(markerState: string): void {
    const writable = this.getWritable();
    writable.__markerState = markerState;
  }

  setFrame(frame?: string): void {
    const writable = this.getWritable();
    writable.__frame = frame;
  }

  setSizeMode(sizeMode?: ImageSizeMode): void {
    const writable = this.getWritable();
    writable.__sizeMode = sizeMode;
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const { theme } = config;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string | undefined {
    return this.__src;
  }

  setSrc(src: string): void {
    const writable = this.getWritable();
    writable.__src = src;
  }

  getAltText(): string {
    return this.__altText;
  }

  // For headless editor, we don't need to render React components
  decorate(): JSX.Element {
    // Return a simple div as placeholder for the headless editor
    // Using a string-based approach instead of JSX for headless environment
    return {
      type: "div",
      props: {
        className: "image-placeholder",
        "data-src": this.__src,
        "data-alt": this.__altText,
      },
      children: [],
    };
  }
}

export function $createImageNode({
  altText,
  height,
  maxWidth = 500,
  captionsEnabled,
  src,
  width,
  showCaption,
  caption,
  key,
  file,
  markerState,
  frame,
  sizeMode,
}: ImagePayload): ImageNode {
  return new ImageNode(
    src,
    altText,
    maxWidth,
    width,
    height,
    showCaption,
    caption,
    captionsEnabled,
    key,
    file,
    markerState,
    frame,
    sizeMode,
  );
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
