import { EventEmitter } from "node:events";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";
import type { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import type {
  OAuthClientInformation,
  OAuthClientInformationFull,
  OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import open from "open";

export class TerminalOAuthProvider extends EventEmitter implements OAuthClientProvider {
  private _tokens: OAuthTokens | undefined;
  private _clientInformation: OAuthClientInformationFull | undefined;

  private codeVerifierValue = "";
  private localServerPort = 4444; // Choose an available port
  private tokenFilePath: string;
  private clientInfoPath: string;

  constructor(host: string) {
    super();

    this.tokenFilePath = join(process.cwd(), ".oauth", host, "token.json");
    this.clientInfoPath = join(process.cwd(), ".oauth", host, "client.json");

    mkdirSync(join(process.cwd(), ".oauth", host), { recursive: true });

    this.loadTokens();
    this.loadClientInfo();
  }

  get redirectUrl() {
    return `http://localhost:${this.localServerPort}/callback`;
  }

  get clientMetadata() {
    return {
      redirect_uris: [this.redirectUrl],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      client_name: "AIGNE Examples",
      client_uri: "https://www.aigne.io/framework",
      logo_uri: "https://www.aigne.io/.well-known/service/blocklet/logo",
      scope: "profile:read blocklet:read blocklet:write",
      tos_uri: "https://www.arcblock.io/en/termsofuse",
      policy_uri: "https://www.arcblock.io/en/privacy",
      contacts: ["support@aigne.io"],
      software_id: "AIGNE Framework",
      software_version: "1.0.0",
    };
  }

  async clientInformation(): Promise<OAuthClientInformation | undefined> {
    return this._clientInformation;
  }

  async saveClientInformation(clientInformation: OAuthClientInformationFull): Promise<void> {
    console.log("Saving client information:", clientInformation);
    this._clientInformation = clientInformation;
    this.persistClientInfo();
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    return this._tokens;
  }

  async saveTokens(tokens: OAuthTokens | undefined): Promise<void> {
    if (tokens) {
      console.log("Saving tokens:", tokens);
      this._tokens = tokens;
      this.persistTokens();
    } else {
      console.error("Reset tokens");
      this._tokens = undefined;
      this.persistTokens();
    }
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    // Create a local server to handle the callback
    return new Promise((resolve, reject) => {
      const server = createServer(async (req, res) => {
        if (req.url?.startsWith("/callback")) {
          const url = new URL(req.url, this.redirectUrl);
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");
          const errorDescription = url.searchParams.get("error_description");

          // Send a response to close the browser window
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <head>
                <title>Authorization</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background-color: #f5f5f5;
                    color: #333;
                  }
                  .container {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                  }
                  h1 {
                    color: ${error ? "#dc3545" : "#28a745"};
                    margin-bottom: 1rem;
                  }
                  p {
                    margin: 0.5rem 0;
                    line-height: 1.5;
                  }
                  .status-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="status-icon">${error ? "❌" : "✅"}</div>
                  <h1>Authorization ${error ? "Failed" : "Successful"}!</h1>
                  ${errorDescription ? `<p>${errorDescription}</p>` : ""}
                  <p>You can close this window and return to the application.</p>
                </div>
                <script>window.close()</script>
              </body>
            </html>
          `);

          // Close the server
          server.close();

          if (code) {
            this.emit("authorized", code);
            console.info("Authorization successful!", Date.now());
            resolve();
          } else {
            this.emit("error", new Error("No authorization code received"));
            reject(new Error("No authorization code received"));
          }
        }
      });

      // Start the local server
      server.listen(this.localServerPort, async () => {
        console.log("Please authorize the application in your browser...");
        // Open the authorization URL in the default browser
        await open(authorizationUrl.toString());
      });
    });
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    this.codeVerifierValue = codeVerifier;
  }

  async codeVerifier(): Promise<string> {
    return this.codeVerifierValue;
  }

  private loadTokens(): void {
    try {
      if (existsSync(this.tokenFilePath)) {
        const data = readFileSync(this.tokenFilePath, "utf8");
        this._tokens = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading tokens:", error);
    }
  }

  private persistTokens(): void {
    try {
      if (this._tokens) {
        writeFileSync(this.tokenFilePath, JSON.stringify(this._tokens, null, 2));
      }
    } catch (error) {
      console.error("Error persisting tokens:", error);
    }
  }

  private loadClientInfo(): void {
    try {
      if (existsSync(this.clientInfoPath)) {
        const data = readFileSync(this.clientInfoPath, "utf8");
        this._clientInformation = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading client information:", error);
    }
  }

  private persistClientInfo(): void {
    try {
      if (this._clientInformation) {
        writeFileSync(this.clientInfoPath, JSON.stringify(this._clientInformation, null, 2));
      }
    } catch (error) {
      console.error("Error persisting client information:", error);
    }
  }
}
