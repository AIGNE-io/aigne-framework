import { expect, spyOn, test } from "bun:test";
import type { Schema } from "jsonschema";
import { generateMapping } from "../../src/data-mapper/index.js";
import {
  addNullableToOptional,
  applyJsonata,
  applyJsonataWithValidation,
  getSchemaFromData,
} from "../../src/data-mapper/tools.js";
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

// New test case: testing the getSchemaFromData function in tools.js
test("getSchemaFromData - basic tests", () => {
  // Test with null data
  expect(getSchemaFromData(null)).toBeNull();

  // Test with undefined data
  expect(getSchemaFromData(undefined)).toBeNull();

  // Test with simple data
  const simpleData = { name: "test", value: 123 };
  const schema = getSchemaFromData(simpleData);
  expect(schema).not.toBeNull();
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  expect((schema as any).type).toBe("object");
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  expect((schema as any).properties.name.type).toBe("string");
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  expect((schema as any).properties.value.type).toBe("integer");
});

// Testing error handling for applyJsonata
test("applyJsonata - error handling", async () => {
  const data = { test: "value" };

  // Using incorrect JSONata expression
  await expect(applyJsonata(data, "$.invalid[")).rejects.toThrow();
});

// Testing error handling for applyJsonataWithValidation
test("applyJsonataWithValidation - error handling", async () => {
  const data = { test: "value" };
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const schema: any = {
    type: "object",
    properties: {
      result: { type: "number" },
    },
    required: ["result"],
  };

  // Testing when expression result is empty
  const result1 = await applyJsonataWithValidation(data, "$.missing", schema);
  expect(result1.success).toBe(false);
  expect(result1.error).toContain("Result is empty");

  // Testing when validation fails
  const result2 = await applyJsonataWithValidation(data, '{"result": $.test}', schema);
  expect(result2.success).toBe(false);
  expect(result2.error).toContain("instance.result is not of a type(s) number");

  // Testing expression error
  const result3 = await applyJsonataWithValidation(data, "$.test[", schema);
  expect(result3.success).toBe(false);
  expect(result3.error).toContain("Validation failed:");
});

// Testing extension functions registered by extendJsonata
test("extendJsonata - registered functions", async () => {
  const testArray = [1, 2, 3, 4, 5];
  const testDates = ["2023-01-01T00:00:00Z", "2023-12-31T00:00:00Z"];

  // Testing max function
  const maxResult = await applyJsonata({ numbers: testArray }, "$max(numbers)");
  expect(maxResult).toBe(5);

  // Testing min function
  const minResult = await applyJsonata({ numbers: testArray }, "$min(numbers)");
  expect(minResult).toBe(1);

  // Testing number function
  const numberResult = await applyJsonata({ value: "123.45" }, "$number(value)");
  expect(numberResult).toBe(123.45);

  // Testing substring function
  const substringResult = await applyJsonata({ text: "Hello World" }, "$substring(text, 0, 5)");
  expect(substringResult).toBe("Hello");

  // Testing replace function
  const replaceStringResult = await applyJsonata(
    { text: "Hello World" },
    '$replace(text, "Hello", "Hi")',
  );
  expect(replaceStringResult).toBe("Hi World");

  // Testing replace function for array processing
  const replaceArrayResult = await applyJsonata(
    { arr: ["Hello 1", "Hello 2"] },
    '$replace(arr, "Hello", "Hi")',
  );
  expect(replaceArrayResult).toEqual(["Hi 1", "Hi 2"]);

  // Testing replace function for object processing
  const replaceObjectResult = await applyJsonata(
    { obj: { key1: "Hello 1", key2: "Hello 2" } },
    '$replace(obj, "Hello", "Hi")',
  );
  expect(replaceObjectResult).toEqual({ key1: "Hi 1", key2: "Hi 2" });

  // Testing toDate function - numeric timestamp
  const toDateFromTimestampResult = await applyJsonata(
    { timestamp: 1672531200000 },
    "$toDate(timestamp)",
  );
  expect(toDateFromTimestampResult).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

  // Testing toDate function - seconds-level timestamp
  const toDateFromSecondTimestampResult = await applyJsonata(
    { timestamp: 1672531200 },
    "$toDate(timestamp)",
  );
  expect(toDateFromSecondTimestampResult).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

  // Testing toDate function - MM/DD/YYYY format
  const toDateFromStringResult = await applyJsonata({ date: "12/31/2022" }, "$toDate(date)");
  expect(toDateFromStringResult).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

  // Testing toDate function - MM/DD/YYYY HH:MM:SS format
  const toDateFromStringWithTimeResult = await applyJsonata(
    { date: "12/31/2022 12:00:00" },
    "$toDate(date)",
  );
  expect(toDateFromStringWithTimeResult).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

  // Testing toDate function error handling
  await expect(applyJsonata({ date: "invalid-date" }, "$toDate(date)")).rejects.toThrow();

  // Testing dateMax function
  const dateMaxResult = await applyJsonata({ dates: testDates }, "$dateMax(dates)");
  expect(dateMaxResult).toBe("2023-12-31T00:00:00Z");

  // Testing dateMin function
  const dateMinResult = await applyJsonata({ dates: testDates }, "$dateMin(dates)");
  expect(dateMinResult).toBe("2023-01-01T00:00:00Z");

  // Testing dateDiff function - days
  const dateDiffDaysResult = await applyJsonata(
    { date1: "2023-01-01T00:00:00Z", date2: "2023-01-11T00:00:00Z" },
    '$dateDiff(date1, date2, "days")',
  );
  expect(dateDiffDaysResult).toBe(10);

  // Testing dateDiff function - hours
  const dateDiffHoursResult = await applyJsonata(
    { date1: "2023-01-01T00:00:00Z", date2: "2023-01-01T10:00:00Z" },
    '$dateDiff(date1, date2, "hours")',
  );
  expect(dateDiffHoursResult).toBe(10);

  // Testing dateDiff function - minutes
  const dateDiffMinutesResult = await applyJsonata(
    { date1: "2023-01-01T00:00:00Z", date2: "2023-01-01T00:30:00Z" },
    '$dateDiff(date1, date2, "minutes")',
  );
  expect(dateDiffMinutesResult).toBe(30);

  // Testing dateDiff function - seconds
  const dateDiffSecondsResult = await applyJsonata(
    { date1: "2023-01-01T00:00:00Z", date2: "2023-01-01T00:00:30Z" },
    '$dateDiff(date1, date2, "seconds")',
  );
  expect(dateDiffSecondsResult).toBe(30);

  // Testing dateDiff function - default unit (milliseconds) is days
  const dateDiffDefaultResult = await applyJsonata(
    { date1: "2023-01-01T00:00:00Z", date2: "2023-01-01T00:00:01Z" },
    "$dateDiff(date1, date2)",
  );
  // Fix: Default unit is days, for a time difference of only 1 second, the result is 0 days
  expect(dateDiffDefaultResult).toBe(0);
});

// Testing addNullableToOptional and makeNullable functions
test("addNullableToOptional - schema modification", () => {
  // Creating a test schema
  const schema: Schema = {
    type: "object",
    properties: {
      required_field: { type: "string" },
      optional_field: { type: "number" },
      nested: {
        type: "object",
        properties: {
          nested_required: { type: "boolean" },
          nested_optional: { type: "string" },
        },
        required: ["nested_required"],
      },
      array_field: {
        type: "array",
        items: {
          type: "object",
          properties: {
            item_field: { type: "string" },
          },
        },
      },
    },
    required: ["required_field", "nested"],
  };

  // Applying addNullableToOptional
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const modifiedSchema = addNullableToOptional(schema) as any;

  // Verifying that required_field type hasn't changed
  expect(modifiedSchema.properties.required_field.type).toBe("string");

  // Verifying that optional_field now allows null
  expect(Array.isArray(modifiedSchema.properties.optional_field.type)).toBe(true);
  expect(modifiedSchema.properties.optional_field.type).toContain("null");

  // Verifying that nested objects are processed correctly
  expect(modifiedSchema.properties.nested.properties.nested_required.type).toBe("boolean");
  expect(Array.isArray(modifiedSchema.properties.nested.properties.nested_optional.type)).toBe(
    true,
  );
  expect(modifiedSchema.properties.nested.properties.nested_optional.type).toContain("null");

  // Verifying that array items are processed correctly
  expect(modifiedSchema.properties.array_field.items.properties.item_field.type[0]).toBe("string");
  expect(modifiedSchema.properties.array_field.items.properties.item_field.type[1]).toBe("null");

  // Testing null or non-object input
  expect(addNullableToOptional(null as unknown as Schema)).toBeNull();
});

// Testing error handling for generateMapping
test("generateMapping - error handling", async () => {
  // Testing when no model is provided
  const result = await generateMapping({ input: testData });
  expect(result).toBeNull();
});

// Testing auto schema generation for source data
test("generateMapping - auto generate schema", async () => {
  const model = new OpenAIChatModel();
  spyOn(model, "process").mockReturnValueOnce(Promise.resolve({ json: resultBasic }));

  // Creating an input without sourceSchema
  const input = { ...testData };

  const result = await generateMapping({
    input,
    model,
  });

  expect(result).not.toBeNull();
  expect(result?.jsonata).toBeDefined();
});

// Simulating JSON parsing errors in reviewer via generateMapping
test("reviewer - JSON parsing errors through generateMapping", async () => {
  // Using constructor to set default return value directly
  const model = new OpenAIChatModel();

  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      json: {
        jsonata: "",
        confidence: 0,
        confidenceReasoning: "JSON parsing failed",
      },
    }),
  );

  // Creating a test input with invalid JSON
  const invalidInput = {
    responseSchema: "}",
    sourceData: "{}",
  };

  const result = await generateMapping({
    input: invalidInput,
    model,
  });

  // Verifying results
  expect(result?.confidence).toBe(0);
});

// Simulating failed data transformation with JSONata in reviewer
test("reviewer - JSON parsing errors through generateMapping", async () => {
  // Using constructor to set default return value directly
  const model = new OpenAIChatModel();

  // Mocking invalid transformation relationship
  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      json: {
        jsonata: "{}",
        confidence: 90,
        confidenceReasoning: "",
      },
    }),
  );

  // Second response returns correct transformation relationship
  spyOn(model, "process").mockReturnValueOnce(
    Promise.resolve({
      json: resultBasic,
    }),
  );

  const result = await generateMapping({
    input: testData,
    model,
  });

  // Verifying results
  expect(result?.confidence).toBeGreaterThan(80);
});
