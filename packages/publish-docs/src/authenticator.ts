import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import { join } from "node:path";
import { parse } from "node:url";
import jwt from "jsonwebtoken";
import open from "open";

const tokenFilePath = join(process.cwd(), ".oauth", "token.json");

async function getOAuthMeta(appUrl: string) {
  const res = await fetch(`${appUrl}/.well-known/oauth-authorization-server`);
  return res.json();
}

export interface AuthenticatorOptions {
  appUrl: string;
  scope: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface OAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
  tokenType: string;
}

async function readTokenFile(
  filePath: string,
): Promise<(OAuthResponse & { created_at?: number }) | null> {
  try {
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function writeTokenFile(filePath: string, token: OAuthResponse) {
  const data = { ...token, created_at: Date.now() };
  await mkdir(join(process.cwd(), ".oauth"), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function isTokenValid(token: OAuthResponse): boolean {
  if (!token?.accessToken) return false;
  try {
    const decoded = jwt.decode(token.accessToken) as { exp?: number };
    if (decoded?.exp) {
      const now = Date.now();
      const expiresAt = decoded.exp * 1000;
      return now < expiresAt;
    }
  } catch {}
  return false;
}

async function refreshToken(
  { appUrl, clientId, clientSecret, redirectUri, scope }: AuthenticatorOptions,
  refreshToken: string,
): Promise<OAuthResponse> {
  const meta = await getOAuthMeta(appUrl);
  const tokenUrl: string = meta.token_endpoint;
  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`,
  });
  if (!tokenRes.ok) {
    throw new Error(`Token refresh failed: ${await tokenRes.text()}`);
  }
  const tokenJson = await tokenRes.json();
  return {
    accessToken: tokenJson.access_token,
    refreshToken: tokenJson.refresh_token,
    expiresIn: tokenJson.expires_in,
    scope: tokenJson.scope,
    tokenType: tokenJson.token_type,
  };
}

export async function authenticator(options: AuthenticatorOptions): Promise<OAuthResponse> {
  const { appUrl, clientId, clientSecret, redirectUri, scope } = options;
  console.log("Checking local token...");
  const localToken = await readTokenFile(tokenFilePath);
  if (localToken?.accessToken && localToken?.refreshToken) {
    if (isTokenValid(localToken)) {
      console.log("Local token is valid, reusing it.");
      return localToken;
    }
    console.log("Token expired, trying to refresh with refresh_token...");
    try {
      const refreshed = await refreshToken(options, localToken?.refreshToken);
      await writeTokenFile(tokenFilePath, refreshed);
      console.log("Token refreshed successfully, local token updated.");
      return refreshed;
    } catch {
      console.log("Token refresh failed, reauthorizing...");
    }
  } else {
    console.log("Local token does not exist, starting authorization process...");
  }
  return new Promise<OAuthResponse>((resolve, reject) => {
    (async () => {
      try {
        const meta = await getOAuthMeta(appUrl);
        const authorizeUrl: string = meta.authorization_endpoint;
        const tokenUrl: string = meta.token_endpoint;

        const codeVerifier = crypto.randomBytes(32).toString("base64url");
        const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

        const state = Math.random().toString(36).slice(2);
        const authUrl = `${authorizeUrl}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256`;

        const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
          (async () => {
            if (req.url?.startsWith("/callback")) {
              const query = parse(req.url, true).query;
              if (query.error) {
                const msg = `Authorization failed: ${query.error}${query.error_description ? ` - ${query.error_description}` : ""}`;
                res.end(msg);
                server.close();
                reject(new Error(msg));
                return;
              }
              if (query.code && typeof query.code === "string") {
                res.end("Authorization successful! You can close this page.");
                server.close();

                try {
                  const tokenRes = await fetch(tokenUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `grant_type=authorization_code&code=${encodeURIComponent(query.code)}&redirect_uri=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&code_verifier=${encodeURIComponent(codeVerifier)}`,
                  });
                  if (!tokenRes.ok) {
                    const errText = await tokenRes.text();
                    reject(new Error(`Token request failed: ${errText}`));
                    return;
                  }
                  const tokenJson = await tokenRes.json();
                  const token = {
                    accessToken: tokenJson.access_token,
                    refreshToken: tokenJson.refresh_token,
                    expiresIn: tokenJson.expires_in,
                    scope: tokenJson.scope,
                    tokenType: tokenJson.token_type,
                  };
                  await writeTokenFile(tokenFilePath, token);
                  console.log("Authorization successful, new token saved.");
                  resolve(token);
                } catch (err) {
                  reject(err);
                }
              }
            }
          })();
        });

        server.listen(7777, () => {
          console.log("Please complete the authorization in your browser...");
          open(authUrl);
        });
      } catch (error) {
        reject(error);
      }
    })();
  });
}
