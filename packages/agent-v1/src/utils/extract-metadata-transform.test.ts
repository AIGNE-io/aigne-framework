import { describe, expect, test } from "@jest/globals";

import { ExtractMetadataTransform } from "./extract-metadata-transform";

describe("ExtractMetadataTransform", () => {
  async function run(str: string, start: string, end: string, step = 1) {
    const s = new ReadableStream({
      start(controller) {
        let t = "";
        for (const i of str) {
          t += i;
          if (t.length === step) {
            controller.enqueue(t);
            t = "";
          }
        }
        controller.enqueue(t);
        controller.close();
      },
    }).pipeThrough(new ExtractMetadataTransform({ start, end }));

    let text = "";
    const matched: string[] = [];
    for await (const i of s) {
      if (i.type === "text") {
        text += i.text;
      } else if (i.type === "match") {
        matched.push(i.text);
      }
    }

    return { text, matched };
  }

  const cases = [
    {
      input:
        'hello<metadata>{"name":"foo","age":120}</metadata>world how<metadata>{"name":"bar","age":130}</metadata> to',
      start: "<metadata>",
      end: "</metadata>",
      expected: {
        text: "helloworld how to",
        matched: ['{"name":"foo","age":120}', '{"name":"bar","age":130}'],
      },
    },
    {
      input: '```metadata{"name":"foo","age":120}```',
      start: "```metadata",
      end: "```",
      expected: { text: "", matched: ['{"name":"foo","age":120}'] },
    },
    {
      input:
        '```metadata{"name":"foo","age":120}``````metadata{"name":"bar","age":130}```',
      start: "```metadata",
      end: "```",
      expected: {
        text: "",
        matched: ['{"name":"foo","age":120}', '{"name":"bar","age":130}'],
      },
    },
  ];

  test("extract metadata transform", async () => {
    for (const c of cases) {
      for (let i = 1; i < c.input.length; i++) {
        expect([await run(c.input, c.start, c.end, i), i]).toEqual([
          c.expected,
          i,
        ]);
      }
    }
  });
});
