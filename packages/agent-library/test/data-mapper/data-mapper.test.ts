import { expect, spyOn, test } from "bun:test";
import { generateMapping } from "../../src/data-mapper/index.js";
import { applyJsonata } from "../../src/data-mapper/tools.js";
import { OpenAIChatModel } from "../_mocks_/mock-models.js";
import { resultArray, resultBasic, resultComplex } from "./mock-model-response.js";
import { testData, testData2, testData3 } from "./test-data.js";

test(
  "generateMapping - basic case",
  async () => {
    const model = new OpenAIChatModel();

    spyOn(model, "process").mockReturnValueOnce(Promise.resolve({ json: resultBasic }));

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
    const model = new OpenAIChatModel();

    spyOn(model, "process").mockReturnValueOnce(Promise.resolve({ json: resultComplex }));

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
    const model = new OpenAIChatModel();

    spyOn(model, "process").mockReturnValueOnce(Promise.resolve({ json: resultArray }));

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
