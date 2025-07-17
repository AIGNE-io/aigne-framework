import { describe, expect, test } from "bun:test";
import { Converter } from "../src/converter/index.js";

describe("Converter", () => {
  describe("markdownToLexical", () => {
    test("should correctly convert inline code inside a markdown link", async () => {
      const markdown = `[\`inline code\` in a link](./test.md)`;
      const converter = new Converter();
      const { content } = await converter.markdownToLexical(markdown, "");

      expect(content).toBeTruthy();

      // @ts-expect-error: lexical structure is not fully typed
      const textNode = content?.root?.children?.[0]?.children?.[0]?.children?.[0];

      expect(textNode?.format).toBe(16); // 16 indicates inline code
      expect(textNode?.text).toBe("inline code");
      expect(textNode?.type).toBe("text");
    });
  });
});
