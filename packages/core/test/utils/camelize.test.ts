import { expect, test } from "bun:test";
import { customCamelize } from "@aigne/core/utils/camelize.js";

test("customCamelize should correctly camelize keys", async () => {
  expect(
    customCamelize({
      first_key: "value1",
      nested_key: {
        nested_key: "value3",
        another_key: {
          another_key: "value4",
        },
        array_key: [
          {
            array_key: "value5",
          },
        ],
      },
      array_key: [
        {
          array_key: "value5",
        },
      ],
    }),
  ).toEqual({
    firstKey: "value1",
    nestedKey: {
      nestedKey: "value3",
      anotherKey: {
        anotherKey: "value4",
      },
      arrayKey: [
        {
          arrayKey: "value5",
        },
      ],
    },
    arrayKey: [
      {
        arrayKey: "value5",
      },
    ],
  });
});

test("customCamelize should correctly handle shallow keys", async () => {
  expect(
    customCamelize(
      {
        first_key: "value1",
        nested_key: {
          nested_key: "value3",
          another_key: {
            another_key: "value4",
          },
        },
      },
      {
        shallowKeys: ["first_key", "nested_key"],
      },
    ),
  ).toEqual({
    firstKey: "value1",
    nestedKey: {
      nested_key: "value3",
      another_key: {
        another_key: "value4",
      },
    },
  });
});

test("customCamelize should skip Date and RegExp", async () => {
  const date = new Date();
  const regexp = /abc/;

  expect(
    customCamelize({
      date_key: date,
      regexp_key: regexp,
    }),
  ).toEqual({
    dateKey: date,
    regexpKey: regexp,
  });
});
