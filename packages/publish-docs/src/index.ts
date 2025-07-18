import { z } from "zod";
import { authenticator } from "./authenticator.js";
import { Generator } from "./generator.js";
import { publisher } from "./publisher.js";
import type { PublishResult } from "./types.js";

const withTokenSchema = z.object({
  sidebarPath: z.string(),
  boardId: z.string(),
  appUrl: z.string().url(),
  accessToken: z.string(),
  slugWithoutExt: z.boolean().optional(),
});

const withAuthSchema = z.object({
  sidebarPath: z.string(),
  boardId: z.string(),
  appUrl: z.string().url(),
  accessToken: z.undefined().optional(),
  scope: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url(),
  slugWithoutExt: z.boolean().optional(),
});

const optionsSchema = z.union([withTokenSchema, withAuthSchema]);
export type PublishDocsOptions = z.infer<typeof optionsSchema>;

export async function publishDocs(options: PublishDocsOptions): Promise<PublishResult> {
  const parsed = optionsSchema.parse(options);

  let accessToken: string;
  if ("accessToken" in parsed && parsed.accessToken) {
    accessToken = parsed.accessToken;
  } else {
    const auth = parsed as z.infer<typeof withAuthSchema>;
    accessToken = (
      await authenticator({
        appUrl: auth.appUrl,
        scope: auth.scope,
        clientId: auth.clientId,
        clientSecret: auth.clientSecret,
        redirectUri: auth.redirectUri,
      })
    ).accessToken;
  }

  const docs = await new Generator({
    sidebarPath: parsed.sidebarPath,
    slugPrefix: parsed.boardId,
    slugWithoutExt: parsed.slugWithoutExt ?? true,
  }).generate();

  const published = await publisher({
    data: { boardId: parsed.boardId, docs },
    appUrl: parsed.appUrl,
    accessToken,
  });

  return published;
}
