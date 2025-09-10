import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import mime from "mime";
import { v7 } from "uuid";
import { formatDate } from "./image-home-path.js";

const getFileExtension = (type: string) => mime.getExtension(type) || "png";

interface FileData {
  mimeType: string;
  type: string;
  data: string;
}

interface SaveOptions {
  dataDir: string;
}

const saveFiles = async (files: FileData[], options: SaveOptions): Promise<FileData[]> => {
  return await Promise.all(
    files.map(async (file) => {
      if (file.type === "file" && typeof file.data === "string") {
        const folder = path.join("files", formatDate());
        const folderWithDataDir = path.join(options.dataDir, folder);
        if (!existsSync(folderWithDataDir)) {
          mkdirSync(folderWithDataDir, { recursive: true });
        }

        const ext = getFileExtension(file.mimeType || "image/png");
        const id = v7();
        const filename = ext ? `${id}.${ext}` : id;

        const imagePath = path.join(folderWithDataDir, filename);

        await writeFile(imagePath, file.data, "base64");

        return { ...file, data: path.join(folder, filename) };
      }

      return file;
    }),
  );
};

export default saveFiles;
