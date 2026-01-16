import path from "node:path";
import type { AFS } from "@aigne/afs";
import cors from "cors";
import express from "express";

export interface ExplorerServerOptions {
  port?: number;
  host?: string;
  /**
   * Path to the dist directory containing the built frontend.
   * If not provided, static file serving will be disabled.
   */
  distPath?: string;
}

export class ExplorerServer {
  private app: express.Application;
  private server?: ReturnType<typeof this.app.listen>;

  constructor(
    private afs: AFS,
    private options: ExplorerServerOptions = {},
  ) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes() {
    // API Routes
    this.app.get("/api/list", async (req, res) => {
      try {
        const path = (req.query.path as string) || "/";
        const maxDepth = req.query.maxDepth ? Number.parseInt(req.query.maxDepth as string, 10) : 1;
        const result = await this.afs.list(path, { maxDepth });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    this.app.get("/api/read", async (req, res) => {
      try {
        const path = req.query.path as string;
        if (!path) {
          res.status(400).json({ error: "Path is required" });
          return;
        }
        const result = await this.afs.read(path);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    this.app.get("/api/search", async (req, res) => {
      try {
        const path = (req.query.path as string) || "/";
        const query = req.query.query as string;
        if (!query) {
          res.status(400).json({ error: "Query is required" });
          return;
        }
        const result = await this.afs.search(path, query);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: String(error) });
      }
    });

    // Serve static files from the dist directory (if provided)
    if (this.options.distPath) {
      const distPath = path.resolve(this.options.distPath);
      this.app.use(express.static(distPath));

      // Serve index.html for all other routes (SPA fallback)
      this.app.use((_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  async start(): Promise<void> {
    const port = this.options.port || 3000;
    const host = this.options.host || "localhost";

    return new Promise((resolve) => {
      this.server = this.app.listen(port, host, () => {
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          // Ignore ERR_SERVER_NOT_RUNNING error
          if (err && (err as NodeJS.ErrnoException).code !== "ERR_SERVER_NOT_RUNNING") {
            reject(err);
          } else {
            this.server = undefined;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}
