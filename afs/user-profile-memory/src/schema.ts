import { z } from "zod";

export const userProfileJsonPathSchema = z.object({
  ops: z
    .array(
      z.object({
        op: z.enum(["add", "remove", "replace"]),
        path: z.string(),
        value: z.string().optional().describe("JSON serialized value for add/replace operations"),
      }),
    )
    .describe("List of operations to update the user profile"),
});

export const userProfileSchema = z.object({
  name: z
    .array(
      z.object({
        name: z.string(),
        remark: z.string().optional(),
      }),
    )
    .optional(),
  gender: z.string().optional(),
  birthday: z.string().optional(),
  languages: z
    .array(
      z.object({
        language: z.string(),
        remark: z.string().optional(),
      }),
    )
    .optional(),
  location: z
    .array(
      z.object({
        country: z.string().optional(),
        city: z.string().optional(),
        address: z.string().optional(),
        remark: z.string().optional(),
      }),
    )
    .optional(),
  interests: z
    .array(
      z.object({
        content: z.string(),
        remark: z.string().optional(),
      }),
    )
    .optional(),
  family: z
    .array(
      z.object({
        member: z.string(),
        relation: z.string().optional(),
        remark: z.string().optional(),
      }),
    )
    .optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        remark: z.string().optional(),
      }),
    )
    .optional(),
});
