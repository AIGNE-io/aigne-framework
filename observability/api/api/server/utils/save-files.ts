import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import mime from "mime";
import { v7 } from "uuid";

const getFileExtension = (type: string) => mime.getExtension(type) || "png";

interface FileData {
  mimeType: string;
  type: string;
  data: string;
}

interface ImageData {
  base64: string;
}
interface SaveOptions {
  dataDir: string;
}

const saveFiles = async (
  files: (FileData | ImageData)[],
  options: SaveOptions,
): Promise<(FileData | ImageData)[]> => {
  return await Promise.all(
    files.map(async (file) => {
      if (options.dataDir && !existsSync(options.dataDir)) {
        mkdirSync(options.dataDir, { recursive: true });
      }

      if ("type" in file && file.type === "file" && typeof file.data === "string") {
        const ext = getFileExtension(file.mimeType || "image/png");
        const id = v7();
        const filename = ext ? `${id}.${ext}` : id;

        const imagePath = path.join(options.dataDir, filename);

        await writeFile(imagePath, file.data, "base64");

        return { ...file, data: imagePath };
      }

      if ("base64" in file && file.base64) {
        const ext = getFileExtension("image/png");
        const id = v7();
        const filename = ext ? `${id}.${ext}` : id;

        const imagePath = path.join(options.dataDir, filename);

        await writeFile(imagePath, file.base64, "base64");

        return {
          ...file,
          base64: `${file.base64.slice(0, 20)}...`,
          path: imagePath,
        };
      }

      return file;
    }),
  );
};

export default saveFiles;
