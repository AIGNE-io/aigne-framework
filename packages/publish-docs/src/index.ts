import { z } from "zod";
import { authenticator } from "./authenticator.js";
import { Generator } from "./generator.js";
import { publisher } from "./publisher.js";

export interface PublishDocsOptions {
  sidebarPath: string;
  boardId?: string;
  appUrl?: string;
  accessToken?: string;
  scope?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export async function publishDocs(options: PublishDocsOptions): Promise<{ success: boolean }> {
  const baseSchema = z.object({
    BOARD_ID: z.string(),
    APP_URL: z.string().url(),
    ACCESS_TOKEN: z.string().optional(),
  });
  const baseEnv = baseSchema.parse({
    BOARD_ID: options.boardId ?? process.env.BOARD_ID,
    APP_URL: options.appUrl ?? process.env.APP_URL,
    ACCESS_TOKEN: options.accessToken ?? process.env.ACCESS_TOKEN,
  });

  let accessToken: string;

  if (baseEnv.ACCESS_TOKEN) {
    accessToken = baseEnv.ACCESS_TOKEN;
  } else {
    const authSchema = z.object({
      SCOPE: z.string(),
      CLIENT_ID: z.string(),
      CLIENT_SECRET: z.string(),
      REDIRECT_URI: z.string().url(),
    });
    const authEnv = authSchema.parse({
      SCOPE: options.scope ?? process.env.SCOPE,
      CLIENT_ID: options.clientId ?? process.env.CLIENT_ID,
      CLIENT_SECRET: options.clientSecret ?? process.env.CLIENT_SECRET,
      REDIRECT_URI: options.redirectUri ?? process.env.REDIRECT_URI,
    });
    accessToken = (
      await authenticator({
        appUrl: baseEnv.APP_URL,
        scope: authEnv.SCOPE,
        clientId: authEnv.CLIENT_ID,
        clientSecret: authEnv.CLIENT_SECRET,
        redirectUri: authEnv.REDIRECT_URI,
      })
    ).accessToken;
  }

  const docs = await new Generator({
    sidebarPath: options.sidebarPath,
    slugPrefix: baseEnv.BOARD_ID,
  }).generate();

  const published = await publisher({
    data: { boardId: baseEnv.BOARD_ID, docs },
    appUrl: baseEnv.APP_URL,
    accessToken,
  });

  return { success: published.success };
}
