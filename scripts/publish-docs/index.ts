import { z } from "zod";
import { authenticator } from "./authenticator.ts";
import { Generator } from "./generator.ts";
import { publisher } from "./publisher.ts";

const baseSchema = z.object({
  BOARD_ID: z.string(),
  APP_URL: z.string().url(),
  ACCESS_TOKEN: z.string().optional(),
});
const baseEnv = baseSchema.parse(process.env);

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
  const authEnv = authSchema.parse(process.env);
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

const docs = await new Generator({ slugPrefix: baseEnv.BOARD_ID }).generate();

const published = await publisher({
  data: { boardId: baseEnv.BOARD_ID, docs },
  appUrl: baseEnv.APP_URL,
  accessToken,
});

console.log("success", published.success);
process.exit(0);
