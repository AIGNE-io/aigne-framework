import { expect, test } from "bun:test";
import { OpenAIChatModel } from "@aigne/openai";
import { generateMapping } from "../../src/data-mapper/index.js";
import { applyJsonata } from "../../src/data-mapper/tools.js";
import { testData, testData2, testData3 } from "./test-data.js";

test(
  "generateMapping - basic case",
  async () => {
    const model = new OpenAIChatModel({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o",
    });

    // spyOn(
    //   (model as unknown as { client: OpenAI }).client.chat.completions,
    //   "create",
    // ).mockReturnValue(
    //   new ReadableStream({
    //     async start(controller) {
    //       const file = await readFile(join(import.meta.dirname, "data-mapper-ai-response.txt"));
    //       for (const line of file.toString().split("\n")) {
    //         if (line) controller.enqueue(JSON.parse(line.replace("data:", "")));
    //       }
    //       controller.close();
    //     },
    //   }) as unknown as APIPromise<Stream<ChatCompletionChunk> | ChatCompletion>,
    // );

    // spyOn(model, "call")
    //   .mockReturnValueOnce(
    //     Promise.resolve({
    //       toolCalls: [
    //         {
    //           id: "plus",
    //           type: "function",
    //           function: {
    //             name: "plus",
    //             arguments: { a: 1, b: 1 },
    //           },
    //         },
    //       ],
    //     }),
    //   )
    //   .mockReturnValueOnce(Promise.resolve({ json: { sum: 2 } }));

    const result = await generateMapping({
      input: testData,
      model,
    });

    console.log("result", result);
    expect(result?.confidence).toBeGreaterThanOrEqual(80);
    expect(result).not.toBeNull();

    // Verify data transformation
    const sourceData = JSON.parse(testData.sourceData);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const transformedData = (await applyJsonata(sourceData, result?.jsonata || "")) as any;

    // Verify key fields
    expect(transformedData.sectionsData.ContentSearchResult.sourceList).toBeDefined();
    expect(transformedData.sectionsData.ContentSearchResult.sourceList.length).toBeGreaterThan(0);
    expect(transformedData.sectionsData.ContentSearchResult.sourceList[0].title).toBeDefined();
  },
  {
    timeout: 100000,
  },
);

test(
  "generateMapping - complex nested structure",
  async () => {
    const model = new OpenAIChatModel({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    });

    const result = await generateMapping({
      input: testData2,
      model,
    });

    console.log("result", result);
    expect(result?.confidence).toBeGreaterThanOrEqual(80);
    expect(result).not.toBeNull();

    // Verify data transformation
    const sourceData = JSON.parse(testData2.sourceData);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const transformedData = (await applyJsonata(sourceData, result?.jsonata || "")) as any;

    // Verify key fields
    expect(transformedData.product.basicInfo.name).toBe("iPhone 15 Pro");
    expect(transformedData.product.basicInfo.price).toBe(999.99);
    expect(transformedData.product.specifications.length).toBe(2);
    expect(transformedData.product.specifications[0].name).toBe("屏幕");
    expect(transformedData.product.reviews[0].user.name).toBe("张三");
    expect(transformedData.product.reviews[0].rating).toBe(5);
  },
  {
    timeout: 100000,
  },
);

test(
  "generateMapping - array processing",
  async () => {
    const model = new OpenAIChatModel({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    });

    const result = await generateMapping({
      input: testData3,
      model,
    });

    console.log("result", result);
    expect(result?.confidence).toBeGreaterThanOrEqual(80);
    expect(result).not.toBeNull();

    // Verify data transformation
    const sourceData = JSON.parse(testData3.sourceData);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const transformedData = (await applyJsonata(sourceData, result?.jsonata || "")) as any;

    // Verify key fields
    expect(transformedData.order.orderId).toBe("ORD-2024-001");
    expect(transformedData.order.status).toBe("processing");
    expect(transformedData.order.items.length).toBe(2);
    expect(transformedData.order.items[0].productId).toBe("P001");
    expect(transformedData.order.items[0].quantity).toBe(2);
    expect(transformedData.order.shipping.method).toBe("express");
    expect(transformedData.order.payment.amount).toBe(320);
  },
  {
    timeout: 100000,
  },
);
