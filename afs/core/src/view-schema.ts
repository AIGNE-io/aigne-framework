import { z } from "zod";
import type { AFSDriver } from "./type.js";

/**
 * Build view schema dynamically based on registered drivers
 *
 * @param drivers - List of registered drivers
 * @returns Zod schema object, or undefined if no drivers support view
 */
export function buildViewSchema(drivers: AFSDriver[]): z.ZodObject<any> | undefined {
  if (!drivers || drivers.length === 0) {
    return undefined;
  }

  // Collect all supported view dimensions
  const supportedDimensions = new Set<string>();

  drivers.forEach((driver) => {
    driver.capabilities.dimensions.forEach((dim) => {
      supportedDimensions.add(dim as string);
    });
  });

  if (supportedDimensions.size === 0) {
    return undefined;
  }

  // Dynamically build view schema object
  const viewSchemaFields: Record<string, z.ZodOptional<z.ZodString>> = {};

  if (supportedDimensions.has("language")) {
    viewSchemaFields.language = z
      .string()
      .optional()
      .describe("Target language for translation (e.g., 'en', 'zh', 'ja')");
  }

  if (supportedDimensions.has("format")) {
    viewSchemaFields.format = z
      .string()
      .optional()
      .describe("Target format conversion (e.g., 'md', 'html', 'pdf')");
  }

  if (supportedDimensions.has("policy")) {
    viewSchemaFields.policy = z
      .string()
      .optional()
      .describe("Content style policy (e.g., 'technical', 'marketing')");
  }

  if (supportedDimensions.has("variant")) {
    viewSchemaFields.variant = z
      .string()
      .optional()
      .describe("Content variant (e.g., 'summary', 'toc', 'index')");
  }

  return z.object(viewSchemaFields);
}

/**
 * Extend base schema with view field
 *
 * @param baseSchema - Base schema without view
 * @param drivers - List of registered drivers
 * @returns Extended schema (with view field if drivers support it)
 */
export function extendSchemaWithView<T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  drivers: AFSDriver[],
): z.ZodObject<any> {
  const viewSchema = buildViewSchema(drivers);

  if (!viewSchema) {
    return baseSchema;
  }

  return baseSchema.extend({
    view: viewSchema.optional().describe("View projection options"),
  });
}
