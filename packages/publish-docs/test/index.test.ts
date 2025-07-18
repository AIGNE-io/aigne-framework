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

    test("should trim trailing line break in code block", async () => {
      const markdown = `
\`\`\`bash
npm install @aigne/core @aigne/openai
\`\`\`
  `;
      const converter = new Converter();
      const { content } = await converter.markdownToLexical(markdown, "");

      expect(content).toBeTruthy();

      // @ts-expect-error: lexical structure is not fully typed
      const codeNode = content?.root?.children?.[0]?.children?.[0];

      expect(codeNode?.type).toBe("code");
      expect(codeNode?.children?.length).toBe(1);
      expect(codeNode?.children[0]?.type).toBe("text");
      expect(codeNode?.children[0]?.text).toBe("npm install @aigne/core @aigne/openai");
    });
  });
});
