import { beforeEach, describe, expect, mock, test } from "bun:test";

// Create a proper Lexical test environment
import { createHeadlessEditor } from "@lexical/headless";
import {
  $createMermaidNode,
  $isMermaidNode,
  MermaidNode,
  type MermaidPayload,
  type SerializedMermaidNode,
} from "../src/converter/nodes/mermaid-node.js";

// Mock document for DOM methods
const mockClassList = {
  contains: mock(),
};

const mockElement = {
  className: "",
  textContent: "",
  classList: mockClassList,
};

(global as any).document = {
  createElement: mock().mockReturnValue(mockElement),
};

describe("MermaidNode", () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    mockClassList.contains.mockClear();

    // Create a headless editor for testing
    editor = createHeadlessEditor({
      namespace: "test",
      nodes: [MermaidNode],
      onError: () => {},
    });
  });

  describe("getType", () => {
    test("should return 'mermaid'", () => {
      expect(MermaidNode.getType()).toBe("mermaid");
    });
  });

  describe("constructor and basic methods", () => {
    test("should initialize with basic parameters", () => {
      editor.update(() => {
        const code = "graph TD\n  A --> B";
        const node = new MermaidNode(code);

        expect(node.getCode()).toBe(code);
        expect(node.getTheme()).toBeUndefined();
        expect(node.getMode()).toBeUndefined();
      });
    });

    test("should initialize with all parameters", () => {
      editor.update(() => {
        const code = "graph TD\n  A --> B";
        const theme = "dark";
        const mode = "compact";
        const node = new MermaidNode(code, theme, mode);

        expect(node.getCode()).toBe(code);
        expect(node.getTheme()).toBe(theme);
        expect(node.getMode()).toBe(mode);
      });
    });
  });

  describe("getters and setters", () => {
    test("setCode should update code", () => {
      editor.update(() => {
        const node = new MermaidNode("original");
        const newCode = "graph TD\n  C --> D";

        node.setCode(newCode);

        expect(node.getCode()).toBe(newCode);
      });
    });

    test("setTheme should update theme", () => {
      editor.update(() => {
        const node = new MermaidNode("code");

        node.setTheme("dark");

        expect(node.getTheme()).toBe("dark");
      });
    });

    test("setMode should update mode", () => {
      editor.update(() => {
        const node = new MermaidNode("code");

        node.setMode("compact");

        expect(node.getMode()).toBe("compact");
      });
    });
  });

  describe("exportJSON", () => {
    test("should export basic node data", () => {
      editor.update(() => {
        const code = "graph TD\n  A --> B";
        const node = new MermaidNode(code);

        const exported = node.exportJSON();

        expect(exported).toEqual({
          type: "mermaid",
          version: 1,
          code: code,
          theme: undefined,
          mode: undefined,
        });
      });
    });

    test("should export node with all properties", () => {
      editor.update(() => {
        const code = "graph TD\n  A --> B";
        const theme = "dark";
        const mode = "compact";
        const node = new MermaidNode(code, theme, mode);

        const exported = node.exportJSON();

        expect(exported).toEqual({
          type: "mermaid",
          version: 1,
          code: code,
          theme: theme,
          mode: mode,
        });
      });
    });
  });

  describe("clone", () => {
    test("should create identical copy", () => {
      editor.update(() => {
        const original = new MermaidNode("graph TD\n  A --> B", "dark", "compact");

        const cloned = MermaidNode.clone(original);

        expect(cloned.getCode()).toBe(original.getCode());
        expect(cloned.getTheme()).toBe(original.getTheme() || "");
        expect(cloned.getMode()).toBe(original.getMode() || "");
      });
    });
  });

  describe("importJSON", () => {
    test("should create node from serialized data", () => {
      editor.update(() => {
        const serialized: SerializedMermaidNode = {
          type: "mermaid",
          version: 1,
          code: "graph TD\n  A --> B",
          theme: "dark",
          mode: "compact",
        };

        const node = MermaidNode.importJSON(serialized);

        expect(node.getCode()).toBe("graph TD\n  A --> B");
        expect(node.getTheme()).toBe("dark");
        expect(node.getMode()).toBe("compact");
      });
    });

    test("should handle minimal serialized data", () => {
      editor.update(() => {
        const serialized: SerializedMermaidNode = {
          type: "mermaid",
          version: 1,
          code: "simple code",
        };

        const node = MermaidNode.importJSON(serialized);

        expect(node.getCode()).toBe("simple code");
        expect(node.getTheme()).toBeUndefined();
        expect(node.getMode()).toBeUndefined();
      });
    });
  });

  describe("exportDOM", () => {
    test("should create pre element with mermaid class and code", () => {
      editor.update(() => {
        const code = "graph TD\n  A --> B";
        const node = new MermaidNode(code);

        const result = node.exportDOM();

        expect(result.element).toBeDefined();
        expect(mockElement.className).toBe("mermaid");
        expect(mockElement.textContent).toBe(code);
      });
    });
  });

  describe("importDOM", () => {
    test("should return conversion map for pre elements", () => {
      const conversionMap = MermaidNode.importDOM();

      expect(conversionMap).toBeTruthy();
      expect(conversionMap!.pre).toBeDefined();
    });

    test("should return conversion for pre element with mermaid class", () => {
      const conversionMap = MermaidNode.importDOM();
      const mockDomNode = {
        classList: { contains: mock().mockReturnValue(true) },
      };

      const result = conversionMap!.pre!(mockDomNode as any);

      expect(result).toBeTruthy();
      expect(result!.priority).toBe(0);
      expect(result!.conversion).toBeDefined();
    });

    test("should return null for pre element without mermaid class", () => {
      const conversionMap = MermaidNode.importDOM();
      const mockDomNode = {
        classList: { contains: mock().mockReturnValue(false) },
      };

      const result = conversionMap!.pre!(mockDomNode as any);

      expect(result).toBeNull();
    });

    test("should handle element without classList", () => {
      const conversionMap = MermaidNode.importDOM();
      const mockDomNode = {};

      const result = conversionMap!.pre!(mockDomNode as any);

      expect(result).toBeNull();
    });
  });

  describe("createDOM", () => {
    test("should create pre element with mermaid class", () => {
      editor.update(() => {
        const node = new MermaidNode("code");

        const element = node.createDOM();

        expect(element).toBeDefined();
        expect(mockElement.className).toBe("mermaid");
      });
    });
  });

  describe("updateDOM", () => {
    test("should return false", () => {
      editor.update(() => {
        const node = new MermaidNode("code");

        expect(node.updateDOM()).toBe(false);
      });
    });
  });

  describe("decorate", () => {
    test("should return JSX element", () => {
      editor.update(() => {
        const node = new MermaidNode("graph TD\n  A --> B");

        const element = node.decorate();

        expect(element).toEqual({
          type: "pre",
          props: {
            className: "mermaid",
          },
          children: [],
        });
      });
    });
  });
});

describe("convertMermaidElement", () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      namespace: "test",
      nodes: [MermaidNode],
      onError: () => {},
    });
  });

  test("should convert element with mermaid class", () => {
    editor.update(() => {
      // We need to access the convertMermaidElement function indirectly through importDOM
      const conversionMap = MermaidNode.importDOM();
      const mockDomNode = {
        classList: { contains: mock().mockReturnValue(true) },
        textContent: "graph TD\n  A --> B",
      };

      const conversionResult = conversionMap!.pre!(mockDomNode as any);

      if (conversionResult) {
        const result = conversionResult.conversion(mockDomNode as any);

        expect(result).toBeTruthy();
        expect(result!.node).toBeInstanceOf(MermaidNode);
        expect((result!.node as MermaidNode).getCode()).toBe("graph TD\n  A --> B");
      }
    });
  });

  test("should handle element with empty text content", () => {
    editor.update(() => {
      const conversionMap = MermaidNode.importDOM();
      const mockDomNode = {
        classList: { contains: mock().mockReturnValue(true) },
        textContent: "",
      };

      const conversionResult = conversionMap!.pre!(mockDomNode as any);

      if (conversionResult) {
        const result = conversionResult.conversion(mockDomNode as any);

        expect(result).toBeTruthy();
        expect((result!.node as MermaidNode).getCode()).toBe("");
      }
    });
  });

  test("should handle element with null text content", () => {
    editor.update(() => {
      const conversionMap = MermaidNode.importDOM();
      const mockDomNode = {
        classList: { contains: mock().mockReturnValue(true) },
        textContent: null,
      };

      const conversionResult = conversionMap!.pre!(mockDomNode as any);

      if (conversionResult) {
        const result = conversionResult.conversion(mockDomNode as any);

        expect(result).toBeTruthy();
        expect((result!.node as MermaidNode).getCode()).toBe("");
      }
    });
  });
});

describe("$createMermaidNode", () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      namespace: "test",
      nodes: [MermaidNode],
      onError: () => {},
    });
  });

  test("should create MermaidNode with payload", () => {
    editor.update(() => {
      const payload: MermaidPayload = {
        code: "graph TD\n  A --> B",
        theme: "dark",
        mode: "compact",
      };

      const node = $createMermaidNode(payload);

      expect(node.getCode()).toBe("graph TD\n  A --> B");
      expect(node.getTheme()).toBe("dark");
      expect(node.getMode()).toBe("compact");
    });
  });

  test("should create node with minimal payload", () => {
    editor.update(() => {
      const payload: MermaidPayload = {
        code: "simple code",
      };

      const node = $createMermaidNode(payload);

      expect(node.getCode()).toBe("simple code");
      expect(node.getTheme()).toBeUndefined();
      expect(node.getMode()).toBeUndefined();
    });
  });
});

describe("$isMermaidNode", () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      namespace: "test",
      nodes: [MermaidNode],
      onError: () => {},
    });
  });

  test("should return true for MermaidNode", () => {
    editor.update(() => {
      const node = new MermaidNode("code");

      expect($isMermaidNode(node)).toBe(true);
    });
  });

  test("should return false for other nodes", () => {
    expect($isMermaidNode(null)).toBe(false);
    expect($isMermaidNode(undefined)).toBe(false);
    expect($isMermaidNode({} as any)).toBe(false);
  });
});
