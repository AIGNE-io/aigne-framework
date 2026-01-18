import { describe, expect, it } from "bun:test";
import { camelize, optionalize, zodParse } from "@aigne/afs-utils/zod/index.js";
import { z } from "zod";

describe("optionalize", () => {
  it("should make schema optional", () => {
    const schema = optionalize(z.string());
    expect(schema.parse("hello")).toBe("hello");
    expect(schema.parse(undefined)).toBeUndefined();
    expect(schema.parse(null)).toBeUndefined();
  });

  it("should transform null to undefined", () => {
    const schema = optionalize(z.number());
    expect(schema.parse(null)).toBeUndefined();
    expect(schema.parse(undefined)).toBeUndefined();
  });

  it("should preserve valid values", () => {
    const schema = optionalize(z.number());
    expect(schema.parse(42)).toBe(42);
    expect(schema.parse(0)).toBe(0);
  });
});

describe("camelize", () => {
  it("should convert snake_case keys to camelCase", () => {
    const schema = camelize(
      z.object({
        userName: z.string(),
        emailAddress: z.string(),
      }),
    );

    const input = {
      user_name: "john",
      email_address: "john@example.com",
    };

    const result = schema.parse(input);
    expect(result).toEqual({
      userName: "john",
      emailAddress: "john@example.com",
    });
  });

  it("should handle already camelCase keys", () => {
    const schema = camelize(
      z.object({
        userName: z.string(),
        emailAddress: z.string(),
      }),
    );

    const input = {
      userName: "john",
      emailAddress: "john@example.com",
    };

    const result = schema.parse(input);
    expect(result).toEqual(input);
  });

  it("should handle shallow conversion by default", () => {
    const schema = camelize(
      z.object({
        userInfo: z.any(),
      }),
    );

    const input = {
      user_info: {
        first_name: "john",
      },
    };

    const result = schema.parse(input);
    expect(result).toEqual({
      userInfo: {
        first_name: "john",
      },
    });
  });

  it("should handle deep conversion with shallow=false", () => {
    const schema = camelize(
      z.object({
        userInfo: z.any(),
      }),
      { shallow: false },
    );

    const input = {
      user_info: {
        first_name: "john",
        last_name: "doe",
      },
    };

    const result = schema.parse(input);
    expect(result).toEqual({
      userInfo: {
        firstName: "john",
        lastName: "doe",
      },
    });
  });

  it("should not camelize non-record values", () => {
    const schema = camelize(z.string());
    expect(schema.parse("hello")).toBe("hello");
  });

  it("should handle arrays", () => {
    const schema = camelize(z.array(z.string()));
    expect(schema.parse(["a", "b"])).toEqual(["a", "b"]);
  });
});

describe("zodParse", () => {
  it("should return parsed value on success", () => {
    const result = zodParse(z.object({ foo: z.string() }), { foo: "bar" });
    expect(result).toEqual({ foo: "bar" });
  });

  it("should return parsed value on success with prefix", () => {
    const result = zodParse(z.object({ foo: z.string() }), { foo: "bar" }, { prefix: "test" });
    expect(result).toEqual({ foo: "bar" });
  });

  it("should throw error with simple type mismatch", () => {
    expect(() => {
      zodParse(z.object({ foo: z.string() }), { foo: 1 } as unknown);
    }).toThrow(/Expected string, received number at "foo"/);
  });

  it("should throw error with prefix in error message", () => {
    expect(() => {
      zodParse(z.object({ foo: z.string() }), { foo: 1 } as unknown, { prefix: "test" });
    }).toThrowErrorMatchingInlineSnapshot(`"test: Expected string, received number at "foo""`);
  });

  it("should throw error with multiple field errors", () => {
    expect(() => {
      zodParse(
        z.object({
          name: z.string(),
          age: z.number(),
          email: z.string().email(),
        }),
        {
          name: 123,
          age: "25",
          email: "invalid",
        } as unknown,
        { prefix: "UserSchema" },
      );
    }).toThrow(/Expected string, received number at "name"/);
  });

  it("should throw error with union type validation", () => {
    expect(() => {
      zodParse(z.object({ foo: z.union([z.string(), z.boolean()]) }), { foo: 1 } as unknown, {
        prefix: "test",
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"test: Expected string, received number at "foo", or Expected boolean, received number at "foo""`,
    );
  });

  it("should throw error with enum validation", () => {
    expect(() => {
      zodParse(
        z.object({
          role: z.enum(["admin", "user", "guest"]),
        }),
        { role: "superuser" } as unknown,
        { prefix: "ConfigSchema" },
      );
    }).toThrow(/Invalid enum value/);
  });

  it("should throw error with nested object validation", () => {
    expect(() => {
      zodParse(
        z.object({
          user: z.object({
            name: z.string(),
            email: z.string().email(),
            age: z.number().positive(),
          }),
        }),
        {
          user: {
            name: 123,
            email: "invalid-email",
            age: -5,
          },
        } as unknown,
        { prefix: "ProfileSchema" },
      );
    }).toThrow(/Expected string, received number at "user.name"/);
  });

  it("should throw error with array validation", () => {
    expect(() => {
      zodParse(
        z.object({
          tags: z.array(z.string().min(3)),
        }),
        {
          tags: ["ok", "x", 123, "valid"],
        } as unknown,
        { prefix: "TagsSchema" },
      );
    }).toThrow(/String must contain at least 3 character\(s\) at "tags\[1\]"/);
  });

  it("should throw error with array of objects validation", () => {
    expect(() => {
      zodParse(
        z.object({
          users: z.array(
            z.object({
              id: z.number(),
              name: z.string(),
            }),
          ),
        }),
        {
          users: [
            { id: 1, name: "Alice" },
            { id: "invalid", name: 123 },
          ],
        } as unknown,
        { prefix: "UsersSchema" },
      );
    }).toThrow(/Expected number, received string at "users\[1\].id"/);
  });

  it("should throw error with missing required fields", () => {
    expect(() => {
      zodParse(
        z.object({
          username: z.string(),
          email: z.string().email(),
          password: z.string().min(8),
        }),
        {
          username: "john",
        } as unknown,
        { prefix: "CreateUser" },
      );
    }).toThrow(/Required at "email"/);
  });

  it("should throw error with string validation constraints", () => {
    expect(() => {
      zodParse(
        z.object({
          password: z.string().min(8).max(20),
        }),
        {
          password: "short",
        } as unknown,
        { prefix: "PasswordSchema" },
      );
    }).toThrow(/String must contain at least 8 character\(s\) at "password"/);
  });

  it("should throw error with number validation constraints", () => {
    expect(() => {
      zodParse(
        z.object({
          age: z.number().min(0).max(120),
        }),
        {
          age: -5,
        } as unknown,
        { prefix: "AgeSchema" },
      );
    }).toThrow(/Number must be greater than or equal to 0 at "age"/);
  });

  it("should throw error with record validation", () => {
    expect(() => {
      zodParse(
        z.object({
          headers: z.record(z.string()),
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "X-Custom": 123,
          },
        } as unknown,
        { prefix: "HeadersSchema" },
      );
    }).toThrow(/Expected string, received number at "headers.X-Custom"/);
  });

  it("should throw error with discriminated union validation", () => {
    expect(() => {
      zodParse(
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("click"), x: z.number(), y: z.number() }),
          z.object({ type: z.literal("keypress"), key: z.string() }),
        ]),
        {
          type: "click",
          key: "invalid",
        } as unknown,
        { prefix: "EventSchema" },
      );
    }).toThrow(/Required at "x"/);
  });

  it("should throw error with optional field having wrong type", () => {
    expect(() => {
      zodParse(
        z.object({
          name: z.string(),
          bio: z.string().optional(),
        }),
        {
          name: "John",
          bio: 123,
        } as unknown,
        { prefix: "ProfileSchema" },
      );
    }).toThrow(/Expected string, received number at "bio"/);
  });

  it("should throw error with tuple validation", () => {
    expect(() => {
      zodParse(
        z.object({
          point: z.tuple([z.number(), z.number()]),
        }),
        {
          point: [10, "20"],
        } as unknown,
        { prefix: "CoordinateSchema" },
      );
    }).toThrow(/Expected number, received string at "point\[1\]"/);
  });

  it("should throw error with custom refinement", () => {
    expect(() => {
      zodParse(
        z.object({
          value: z.number().refine((n) => n % 2 === 0, {
            message: "Number must be even",
          }),
        }),
        {
          value: 3,
        },
        { prefix: "EvenNumberSchema" },
      );
    }).toThrow(/Number must be even at "value"/);
  });

  it("should handle complex nested validation errors", () => {
    expect(() => {
      zodParse(
        z.object({
          metadata: z.object({
            tags: z.array(z.string()),
            settings: z.record(z.boolean()),
          }),
          items: z.array(
            z.object({
              id: z.string().uuid(),
              count: z.number().int().positive(),
            }),
          ),
        }),
        {
          metadata: {
            tags: ["valid", 123],
            settings: {
              enabled: true,
              debug: "not a boolean",
            },
          },
          items: [
            { id: "not-a-uuid", count: 1.5 },
            { id: "also-invalid", count: -1 },
          ],
        } as unknown,
        { prefix: "ComplexSchema" },
      );
    }).toThrow(/metadata/);
  });

  it("should support custom prefix separator", () => {
    expect(() => {
      zodParse(z.object({ foo: z.string() }), { foo: 1 } as unknown, {
        prefix: "test",
        prefixSeparator: " -> ",
      });
    }).toThrow(/test -> Expected string, received number at "foo"/);
  });

  it("should support async parsing with async option", async () => {
    const asyncSchema = z.object({
      email: z.string().email(),
      username: z.string().refine(
        async (username) => {
          // Simulate async validation
          await new Promise((resolve) => setTimeout(resolve, 10));
          return username !== "taken";
        },
        { message: "Username is already taken" },
      ),
    });

    const result = await zodParse(
      asyncSchema,
      { email: "test@example.com", username: "available" },
      { async: true },
    );

    expect(result).toEqual({ email: "test@example.com", username: "available" });
  });

  it("should throw error with async parsing when validation fails", async () => {
    const asyncSchema = z.object({
      username: z.string().refine(
        async (username) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return username !== "taken";
        },
        { message: "Username is already taken" },
      ),
    });

    await expect(
      zodParse(asyncSchema, { username: "taken" }, { async: true, prefix: "AsyncValidation" }),
    ).rejects.toThrow(/Username is already taken at "username"/);
  });

  it("should throw error with async parsing for type mismatch", async () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    await expect(
      zodParse(schema, { name: 123, age: "25" } as unknown, { async: true, prefix: "AsyncTest" }),
    ).rejects.toThrow(/Expected string, received number at "name"/);
  });

  it("should handle async parsing with complex schemas", async () => {
    const asyncSchema = z.object({
      data: z.object({
        items: z.array(
          z.object({
            id: z.string().refine(
              async (id) => {
                await new Promise((resolve) => setTimeout(resolve, 5));
                return id.length > 3;
              },
              { message: "ID must be longer than 3 characters" },
            ),
          }),
        ),
      }),
    });

    const result = await zodParse(
      asyncSchema,
      {
        data: {
          items: [{ id: "item1" }, { id: "item2" }],
        },
      },
      { async: true },
    );

    expect(result).toEqual({
      data: {
        items: [{ id: "item1" }, { id: "item2" }],
      },
    });
  });

  it("should return Promise when async is true", () => {
    const schema = z.object({ foo: z.string() });
    const result = zodParse(schema, { foo: "bar" }, { async: true });

    expect(result).toBeInstanceOf(Promise);
  });

  it("should not return Promise when async is false or undefined", () => {
    const schema = z.object({ foo: z.string() });

    const result1 = zodParse(schema, { foo: "bar" });
    expect(result1).not.toBeInstanceOf(Promise);
    expect(result1).toEqual({ foo: "bar" });

    const result2 = zodParse(schema, { foo: "bar" }, { async: false });
    expect(result2).not.toBeInstanceOf(Promise);
    expect(result2).toEqual({ foo: "bar" });
  });
});
