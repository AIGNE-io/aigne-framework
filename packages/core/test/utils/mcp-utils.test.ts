import { describe, expect, test } from "bun:test";
import { z, ZodFirstPartyTypeKind } from "zod";
import { toolFromMCPTool } from "../../src/utils/mcp-utils.js";
import type { ListToolsResult } from "@modelcontextprotocol/sdk/types.js";
import type { MCPBaseOptions } from "../../src/agents/mcp-agent.js";

describe("toolFromMCPTool", () => {
  const mockOptions: MCPBaseOptions = {
    // @ts-expect-error - Mock options for testing
    baseUrl: "http://test.com",
    apiKey: "test-key",
  };

  test("should create MCPTool with empty input schema", () => {
    const mockTool: ListToolsResult["tools"][number] = {
      name: "test-tool",
      description: "A test tool",
      inputSchema: {
        type: "object",
        properties: {},
      },
    };

    const result = toolFromMCPTool(mockTool, mockOptions);

    expect(result.name).toBe("test-tool");
    expect(result.description).toBe("A test tool");

    // Check that the schema is an empty object schema
    const inputSchema = result.inputSchema as z.ZodObject<Record<string, never>>;
    expect(inputSchema._def.typeName).toBe(ZodFirstPartyTypeKind.ZodObject);
    expect(Object.keys(inputSchema.shape)).toHaveLength(0);
    expect(inputSchema._def.unknownKeys).toBe("passthrough");
  });

  test("should create MCPTool with non-empty input schema", () => {
    const mockTool: ListToolsResult["tools"][number] = {
      name: "test-tool",
      description: "A test tool",
      inputSchema: {
        type: "object",
        properties: {
          param1: {
            type: "string",
            description: "First parameter",
          },
          param2: {
            type: "number",
            description: "Second parameter",
          },
        },
        required: ["param1"],
      },
    };

    const result = toolFromMCPTool(mockTool, mockOptions);

    expect(result.name).toBe("test-tool");
    expect(result.description).toBe("A test tool");

    // Verify the input schema structure
    const inputSchema = result.inputSchema as z.ZodObject<{
      param1: z.ZodString;
      param2: z.ZodOptional<z.ZodNumber>;
    }>;

    // Check param1 is a required string
    expect(inputSchema.shape.param1).toBeInstanceOf(z.ZodString);

    // Check param2 is an optional number
    expect(inputSchema.shape.param2).toBeInstanceOf(z.ZodOptional);
    expect(inputSchema.shape.param2._def.innerType).toBeInstanceOf(z.ZodNumber);

    // Check if fields are required
    const parsed = inputSchema.safeParse({});
    expect(parsed.success).toBe(false);
    if (!parsed.success && parsed.error.issues.length > 0) {
      expect(parsed.error.issues[0]?.path).toEqual(["param1"]);
    }
  });
});
