import { describe, expect, test } from "bun:test";
import type { View } from "../src/type.js";
import { normalizeViewKey } from "../src/view-key.js";

describe("normalizeViewKey", () => {
  describe("Basic normalization", () => {
    test("should normalize single dimension", () => {
      const view: View = { language: "en" };
      expect(normalizeViewKey(view)).toBe("language=en");
    });

    test("should normalize multiple dimensions in fixed order", () => {
      const view: View = {
        language: "zh",
        format: "png",
      };
      expect(normalizeViewKey(view)).toBe("language=zh;format=png");
    });

    test("should use fixed order regardless of input order", () => {
      // Different input orders should produce the same output
      const view1: View = { format: "png", language: "en" };
      const view2: View = { language: "en", format: "png" };

      const key1 = normalizeViewKey(view1);
      const key2 = normalizeViewKey(view2);

      expect(key1).toBe(key2);
      expect(key1).toBe("language=en;format=png");
    });

    test("should handle all four dimensions", () => {
      const view: View = {
        policy: "technical",
        variant: "summary",
        format: "html",
        language: "ja",
      };

      // Fixed order: language → format → variant → policy
      expect(normalizeViewKey(view)).toBe(
        "language=ja;format=html;variant=summary;policy=technical",
      );
    });
  });

  describe("Case and whitespace normalization", () => {
    test("should convert to lowercase", () => {
      const view: View = { language: "EN", format: "PNG" };
      expect(normalizeViewKey(view)).toBe("language=en;format=png");
    });

    test("should trim whitespace", () => {
      const view: View = { language: "  en  ", format: " png " };
      expect(normalizeViewKey(view)).toBe("language=en;format=png");
    });

    test("should handle mixed case and whitespace", () => {
      const view: View = {
        language: " ZH ",
        format: "WebP  ",
        variant: "  Summary",
      };
      expect(normalizeViewKey(view)).toBe("language=zh;format=webp;variant=summary");
    });
  });

  describe("Empty and partial views", () => {
    test("should handle empty view", () => {
      const view: View = {};
      expect(normalizeViewKey(view)).toBe("");
    });

    test("should omit undefined dimensions", () => {
      const view: View = { language: "en", format: undefined };
      expect(normalizeViewKey(view)).toBe("language=en");
    });

    test("should handle only middle dimension", () => {
      const view: View = { format: "png" };
      expect(normalizeViewKey(view)).toBe("format=png");
    });

    test("should handle only last dimension", () => {
      const view: View = { policy: "marketing" };
      expect(normalizeViewKey(view)).toBe("policy=marketing");
    });

    test("should handle sparse dimensions", () => {
      const view: View = { language: "en", policy: "technical" };
      // format and variant omitted
      expect(normalizeViewKey(view)).toBe("language=en;policy=technical");
    });
  });

  describe("Consistency guarantees", () => {
    test("same view object should produce same key", () => {
      const view: View = { language: "zh", format: "png" };
      const key1 = normalizeViewKey(view);
      const key2 = normalizeViewKey(view);
      expect(key1).toBe(key2);
    });

    test("equivalent views with different casing should produce same key", () => {
      const view1: View = { language: "EN", format: "PNG" };
      const view2: View = { language: "en", format: "png" };
      expect(normalizeViewKey(view1)).toBe(normalizeViewKey(view2));
    });

    test("equivalent views with different whitespace should produce same key", () => {
      const view1: View = { language: "en", format: "png" };
      const view2: View = { language: " en ", format: "png  " };
      expect(normalizeViewKey(view1)).toBe(normalizeViewKey(view2));
    });

    test("should be stable across different key insertion orders", () => {
      // Simulate different object creation patterns
      const view1: View = {};
      view1.language = "zh";
      view1.format = "webp";
      view1.variant = "thumbnail";

      const view2: View = {};
      view2.variant = "thumbnail";
      view2.language = "zh";
      view2.format = "webp";

      expect(normalizeViewKey(view1)).toBe(normalizeViewKey(view2));
    });
  });

  describe("Real-world use cases", () => {
    test("i18n translation view", () => {
      const view: View = { language: "ja" };
      expect(normalizeViewKey(view)).toBe("language=ja");
    });

    test("image format conversion", () => {
      const view: View = { format: "webp" };
      expect(normalizeViewKey(view)).toBe("format=webp");
    });

    test("translated image", () => {
      const view: View = { language: "zh", format: "png" };
      expect(normalizeViewKey(view)).toBe("language=zh;format=png");
    });

    test("document summary in different language", () => {
      const view: View = { language: "en", variant: "summary" };
      expect(normalizeViewKey(view)).toBe("language=en;variant=summary");
    });

    test("marketing content in specific format", () => {
      const view: View = {
        language: "zh",
        format: "html",
        policy: "marketing",
      };
      expect(normalizeViewKey(view)).toBe("language=zh;format=html;policy=marketing");
    });

    test("full view specification", () => {
      const view: View = {
        language: "ja",
        format: "pdf",
        variant: "toc",
        policy: "technical",
      };
      expect(normalizeViewKey(view)).toBe("language=ja;format=pdf;variant=toc;policy=technical");
    });
  });

  describe("Edge cases", () => {
    test("should handle empty strings", () => {
      const view: View = { language: "", format: "png" };
      // Empty string is falsy after trim, should be omitted
      expect(normalizeViewKey(view)).toBe("format=png");
    });

    test("should handle only whitespace", () => {
      const view: View = { language: "   ", format: "png" };
      // Only whitespace becomes empty after trim, should be omitted
      expect(normalizeViewKey(view)).toBe("format=png");
    });

    test("should handle special characters in values", () => {
      const view: View = {
        language: "zh-CN",
        format: "image/png",
        variant: "v1.0",
      };
      expect(normalizeViewKey(view)).toBe("language=zh-cn;format=image/png;variant=v1.0");
    });
  });
});
