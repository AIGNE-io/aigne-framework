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
      const path = (req.query.path as string) || "/";
      const maxDepth = req.query.maxDepth ? Number.parseInt(req.query.maxDepth as string, 10) : 1;
      const result = await this.afs.list(path, { maxDepth });
      res.json(result);
    });

    this.app.get("/api/read", async (req, res) => {
      const path = req.query.path as string;
      if (!path) {
        res.status(400).json({ error: "Path is required" });
        return;
      }
      const result = await this.afs.read(path);
      res.json(result);
    });

    this.app.get("/api/search", async (req, res) => {
      const path = (req.query.path as string) || "/";
      const query = req.query.query as string;
      if (!query) {
        res.status(400).json({ error: "Query is required" });
        return;
      }
      const result = await this.afs.search(path, query);
      res.json(result);
    });

    // Serve static files from the dist directory (if provided)
    if (this.options.distPath) {
      const distPath = path.resolve(this.options.distPath);
      this.app.use(express.static(distPath));
      this.app.get("/{*splat}", (_req, res) => {
        res.sendFile("index.html", { root: distPath });
      });
    }

    // Global error handler
    this.app.use(
      (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(500).json({ error: err.message || String(err) });
      },
    );
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
