import path from "node:path";
import { startObservabilityBlockletServer } from "@aigne/observability-api/server";
import { getComponentMountPoint } from "@blocklet/sdk/lib/component";
import middleware from "@blocklet/sdk/lib/middlewares";
import fallback from "@blocklet/sdk/lib/middlewares/fallback";
import dotenv from "dotenv-flow";
import express, { type NextFunction, type Request, type Response } from "express";
import mime from "mime";
import { v7 } from "uuid";

dotenv.config({ silent: true });
const { uploadToMediaKit } = require("@blocklet/uploader-server");

const ADMIN_ROLES = ["owner", "admin"];

function requireAdminRole(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role && ADMIN_ROLES.includes(req.user?.role)) {
    return next();
  }

  res.status(403).json({ error: "Permission denied" });
  return;
}

const getFileExtension = (type: string) => mime.getExtension(type) || "png";

const isProduction =
  process.env.NODE_ENV === "production" || process.env.ABT_NODE_SERVICE_ENV === "production";
const MEDIA_KIT_DID = "z8ia1mAXo8ZE7ytGF36L5uBf9kD2kenhqFGp9";

async function formatAndUpload<T extends Record<string, any>>(
  items: T[],
  getBase64: (item: T) => string | undefined,
  replace: (item: T, filename: string) => T,
): Promise<T[]> {
  return Promise.all(
    items.map(async (item) => {
      const base64 = getBase64(item);
      if (!base64) return item;

      const mountPoint = getComponentMountPoint(MEDIA_KIT_DID);
      if (!mountPoint) return item;

      const id = v7();
      const ext = getFileExtension(item?.mimeType || "image/png");
      const fileName = ext ? `${id}.${ext}` : id;

      try {
        const { data } = await uploadToMediaKit({ base64, fileName });
        return replace(item, data.filename);
      } catch {
        return item;
      }
    }),
  );
}

const startServer = async () => {
  const { app, server } = await startObservabilityBlockletServer({
    port: Number(process.env.BLOCKLET_PORT) || 3000,
    dbUrl: path.join("file:", process.env.BLOCKLET_DATA_DIR || "", "observer.db"),
    traceTreeMiddleware: [middleware.session({ accessKey: true }), requireAdminRole],
    options: {
      formatOutputFiles: (files) =>
        formatAndUpload(
          files,
          (file) =>
            file &&
            typeof file === "object" &&
            file.type === "file" &&
            typeof file.data === "string"
              ? file.data
              : undefined,
          (file, filename) => ({ ...file, data: `${file.data.slice(0, 20)}...`, path: filename }),
        ),

      formatOutputImages: (images) =>
        formatAndUpload(
          images,
          (image) =>
            image && typeof image === "object" && image.base64 ? image.base64 : undefined,
          (image, filename) => ({
            ...image,
            base64: `${image.base64.slice(0, 20)}...`,
            path: filename,
          }),
        ),
    },
  });

  const BLOCKLET_APP_DIR = process.env.BLOCKLET_APP_DIR;
  if (isProduction && BLOCKLET_APP_DIR) {
    const staticDir = path.resolve(BLOCKLET_APP_DIR, "dist");
    app.use(express.static(staticDir, { maxAge: "1d", index: false }));
    app.use(fallback("index.html", { root: staticDir }));
  }

  return { app, server };
};

if (isProduction) {
  startServer();
}

export default startServer;
