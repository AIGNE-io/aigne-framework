import { beforeEach, describe, expect, mock, test } from "bun:test";

// Create a proper Lexical test environment
import { createHeadlessEditor } from "@lexical/headless";
import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  type ImagePayload,
  type SerializedImageNode,
} from "../src/converter/nodes/image-node.js";

// Mock document for DOM methods
const mockSetAttribute = mock();
const mockElement = {
  setAttribute: mockSetAttribute,
  className: "",
};

(global as any).document = {
  createElement: mock().mockReturnValue(mockElement),
};

describe("ImageNode", () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    mockSetAttribute.mockClear();

    // Create a headless editor for testing
    editor = createHeadlessEditor({
      namespace: "test",
      nodes: [ImageNode],
      onError: () => {},
    });
  });

  describe("getType", () => {
    test("should return 'image'", () => {
      expect(ImageNode.getType()).toBe("image");
    });
  });

  describe("constructor and basic methods", () => {
    test("should initialize with basic parameters", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test image", 500);

        expect(node.getSrc()).toBe("test.jpg");
        expect(node.getAltText()).toBe("Test image");
        expect(node.__maxWidth).toBe(500);
        expect(node.__width).toBe("inherit");
        expect(node.__height).toBe("inherit");
        expect(node.__showCaption).toBe(false);
        expect(node.__captionsEnabled).toBe(true);
        expect(node.__sizeMode).toBe("original");
      });
    });

    test("should initialize with all parameters", () => {
      editor.update(() => {
        const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
        const node = new ImageNode(
          "test.jpg",
          "Test image",
          400,
          200,
          150,
          true,
          undefined,
          false,
          undefined,
          mockFile,
          "marker",
          "frame",
          "small",
        );

        expect(node.getSrc()).toBe("test.jpg");
        expect(node.getAltText()).toBe("Test image");
        expect(node.__maxWidth).toBe(400);
        expect(node.__width).toBe(200);
        expect(node.__height).toBe(150);
        expect(node.__showCaption).toBe(true);
        expect(node.__captionsEnabled).toBe(false);
        expect(node.file).toBe(mockFile);
        expect(node.__markerState).toBe("marker");
        expect(node.__frame).toBe("frame");
        expect(node.__sizeMode).toBe("small");
      });
    });
  });

  describe("setters", () => {
    test("setWidthAndHeight should update dimensions", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test", 500);
        node.setWidthAndHeight(300, 200);

        expect(node.__width).toBe(300);
        expect(node.__height).toBe(200);
      });
    });

    test("setShowCaption should update caption visibility", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test", 500);
        node.setShowCaption(true);

        expect(node.__showCaption).toBe(true);
      });
    });

    test("setMarkerState should update marker state", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test", 500);
        node.setMarkerState("new-marker");

        expect(node.__markerState).toBe("new-marker");
      });
    });

    test("setFrame should update frame", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test", 500);
        node.setFrame("new-frame");

        expect(node.__frame).toBe("new-frame");
      });
    });

    test("setSizeMode should update size mode", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test", 500);
        node.setSizeMode("best-fit");

        expect(node.__sizeMode).toBe("best-fit");
      });
    });

    test("setSrc should update source", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test", 500);
        node.setSrc("new.jpg");

        expect(node.getSrc()).toBe("new.jpg");
      });
    });
  });

  describe("exportJSON", () => {
    test("should export node data correctly", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test image", 500, 200, 150);
        node.setShowCaption(true);
        node.setMarkerState("marker");
        node.setFrame("frame");
        node.setSizeMode("small");

        const exported = node.exportJSON();

        expect(exported.type).toBe("image");
        expect(exported.version).toBe(1);
        expect(exported.altText).toBe("Test image");
        expect(exported.src).toBe("test.jpg");
        expect(exported.maxWidth).toBe(500);
        expect(exported.width).toBe(200);
        expect(exported.height).toBe(150);
        expect(exported.showCaption).toBe(true);
        expect(exported.markerState).toBe("marker");
        expect(exported.frame).toBe("frame");
        expect(exported.sizeMode).toBe("small");
      });
    });

    test("should handle inherit dimensions", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test", 500);
        const exported = node.exportJSON();

        expect(exported.width).toBe(0);
        expect(exported.height).toBe(0);
      });
    });
  });

  describe("clone", () => {
    test("should create identical copy", () => {
      editor.update(() => {
        const original = new ImageNode(
          "test.jpg",
          "Test image",
          500,
          200,
          150,
          true,
          undefined,
          false,
          undefined,
          new File(["test"], "test.jpg"),
          "marker",
          "frame",
          "small",
        );

        const cloned = ImageNode.clone(original);

        expect(cloned.getSrc()).toBe(original.getSrc());
        expect(cloned.getAltText()).toBe(original.getAltText());
        expect(cloned.__maxWidth).toBe(original.__maxWidth);
        expect(cloned.__width).toBe(original.__width);
        expect(cloned.__height).toBe(original.__height);
        expect(cloned.__showCaption).toBe(original.__showCaption);
        expect(cloned.__captionsEnabled).toBe(original.__captionsEnabled);
        expect(cloned.file).toBe(original.file);
        expect(cloned.__markerState).toBe(original.__markerState);
        expect(cloned.__frame).toBe(original.__frame);
        expect(cloned.__sizeMode).toBe(original.__sizeMode);
      });
    });
  });

  describe("importJSON", () => {
    test("should create node from serialized data", () => {
      editor.update(() => {
        const serialized: SerializedImageNode = {
          type: "image",
          version: 1,
          altText: "Test image",
          src: "test.jpg",
          maxWidth: 500,
          width: 200,
          height: 150,
          showCaption: true,
          caption: {
            editorState:
              '{"root":{"children":[],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
          },
          markerState: "marker",
          frame: "frame",
          sizeMode: "best-fit",
        };

        const node = ImageNode.importJSON(serialized);

        expect(node.getAltText()).toBe("Test image");
        expect(node.getSrc()).toBe("test.jpg");
        expect(node.__maxWidth).toBe(500);
        expect(node.__width).toBe(200);
        expect(node.__height).toBe(150);
        expect(node.__showCaption).toBe(true);
        expect(node.__markerState).toBe("marker");
        expect(node.__frame).toBe("frame");
        expect(node.__sizeMode).toBe("best-fit");
      });
    });
  });

  describe("exportDOM", () => {
    test("should create img element with correct attributes", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test image", 500);

        const result = node.exportDOM();

        expect(result.element).toBeDefined();
        expect(mockSetAttribute).toHaveBeenCalledWith("src", "test.jpg");
        expect(mockSetAttribute).toHaveBeenCalledWith("alt", "Test image");
      });
    });

    test("should handle undefined src", () => {
      editor.update(() => {
        const node = new ImageNode(undefined, "Test image", 500);

        node.exportDOM();

        expect(mockSetAttribute).toHaveBeenCalledWith("src", "");
      });
    });
  });

  describe("importDOM", () => {
    test("should return conversion map for img elements", () => {
      const conversionMap = ImageNode.importDOM();

      expect(conversionMap).toBeTruthy();
      expect(conversionMap!.img).toBeDefined();
      expect(conversionMap!.img().priority).toBe(0);
      expect(conversionMap!.img().conversion).toBeDefined();
    });
  });

  describe("createDOM", () => {
    test("should create span element with theme class", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test", 500);
        const config = {
          theme: { image: "test-image-class" },
        };

        const element = node.createDOM(config);

        expect(element).toBeDefined();
      });
    });
  });

  describe("updateDOM", () => {
    test("should return false", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test", 500);

        expect(node.updateDOM()).toBe(false);
      });
    });
  });

  describe("decorate", () => {
    test("should return JSX element", () => {
      editor.update(() => {
        const node = new ImageNode("test.jpg", "Test image", 500);

        const element = node.decorate();

        expect(element).toEqual({
          type: "div",
          props: {
            className: "image-placeholder",
            "data-src": "test.jpg",
            "data-alt": "Test image",
          },
          children: [],
        });
      });
    });
  });
});

describe("$createImageNode", () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      namespace: "test",
      nodes: [ImageNode],
      onError: () => {},
    });
  });

  test("should create ImageNode with payload", () => {
    editor.update(() => {
      const payload: ImagePayload = {
        src: "test.jpg",
        altText: "Test image",
        maxWidth: 400,
        width: 200,
        height: 150,
        showCaption: true,
        sizeMode: "best-fit",
      };

      const node = $createImageNode(payload);

      expect(node.getSrc()).toBe("test.jpg");
      expect(node.getAltText()).toBe("Test image");
      expect(node.__maxWidth).toBe(400);
      expect(node.__width).toBe(200);
      expect(node.__height).toBe(150);
      expect(node.__showCaption).toBe(true);
      expect(node.__sizeMode).toBe("best-fit");
    });
  });

  test("should use default maxWidth", () => {
    editor.update(() => {
      const node = $createImageNode({ altText: "Test" });

      expect(node.__maxWidth).toBe(500);
    });
  });
});

describe("$isImageNode", () => {
  let editor: ReturnType<typeof createHeadlessEditor>;

  beforeEach(() => {
    editor = createHeadlessEditor({
      namespace: "test",
      nodes: [ImageNode],
      onError: () => {},
    });
  });

  test("should return true for ImageNode", () => {
    editor.update(() => {
      const node = new ImageNode("test.jpg", "Test", 500);

      expect($isImageNode(node)).toBe(true);
    });
  });

  test("should return false for other nodes", () => {
    expect($isImageNode(null)).toBe(false);
    expect($isImageNode(undefined)).toBe(false);
    expect($isImageNode({})).toBe(false);
  });
});
