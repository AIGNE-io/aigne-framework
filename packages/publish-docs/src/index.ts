import { z } from "zod";
import { authenticator } from "./authenticator.js";
import { findOrCreateBoard } from "./board.js";
import { Generator } from "./generator.js";
import { publisher } from "./publisher.js";
import type { PublishResult } from "./types.js";

const boardMetaSchema = z
  .object({
    category: z.array(z.string()),
    githubRepoUrl: z.string(),
    commitSha: z.string(),
    languages: z.array(z.string()),
  })
  .passthrough(); // Allow additional fields to pass through validation

const withTokenSchema = z.object({
  sidebarPath: z.string(),
  boardId: z.string().optional(),
  appUrl: z.string().url(),
  accessToken: z.string(),
  slugWithoutExt: z.boolean().optional(),
  autoCreateBoard: z.boolean().optional(),
  boardName: z.string().optional(),
  boardDesc: z.string().optional(),
  boardCover: z.string().optional(),
  boardMeta: boardMetaSchema.optional(),
  mediaFolder: z.string().optional(),
  cacheFilePath: z.string().optional(),
});

const withAuthSchema = z.object({
  sidebarPath: z.string(),
  boardId: z.string().optional(),
  appUrl: z.string().url(),
  accessToken: z.undefined().optional(),
  scope: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url(),
  slugWithoutExt: z.boolean().optional(),
  autoCreateBoard: z.boolean().optional(),
  boardName: z.string().optional(),
  boardDesc: z.string().optional(),
  boardCover: z.string().optional(),
  boardMeta: boardMetaSchema.optional(),
  mediaFolder: z.string().optional(),
  cacheFilePath: z.string().optional(),
});

const optionsSchema = z.union([withTokenSchema, withAuthSchema]);
export type PublishDocsOptions = z.infer<typeof optionsSchema>;

// Re-export BoardMeta type for external use
export type { BoardMeta } from "./board.js";

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

  // Handle board creation if needed
  let finalBoardId = parsed.boardId;

  if (parsed.autoCreateBoard) {
    if (!parsed.boardName) {
      throw new Error("boardName is required when autoCreateBoard is true");
    }

    finalBoardId = await findOrCreateBoard({
      appUrl: parsed.appUrl,
      accessToken,
      boardId: parsed.boardId ?? "",
      boardName: parsed.boardName,
      desc: parsed.boardDesc,
      cover: parsed.boardCover,
      meta: parsed.boardMeta,
    });
  }

  if (!finalBoardId) {
    throw new Error("boardId is required when autoCreateBoard is false");
  }

  const docs = await new Generator({
    sidebarPath: parsed.sidebarPath,
    slugPrefix: finalBoardId,
    slugWithoutExt: parsed.slugWithoutExt ?? true,
    uploadConfig: {
      appUrl: parsed.appUrl,
      accessToken,
      mediaFolder: parsed.mediaFolder,
      cacheFilePath: parsed.cacheFilePath,
      concurrency: 3,
    },
  }).generate();

  const published = await publisher({
    data: {
      boardId: finalBoardId,
      boardName: parsed.boardName,
      docs,
    },
    appUrl: parsed.appUrl,
    accessToken,
  });

  return published;
}
