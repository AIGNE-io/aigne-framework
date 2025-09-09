import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import dayjs from "@abtnode/util/lib/dayjs";
import isBase64 from "is-base64";
import mime from "mime";
import { v7 } from "uuid";

const getFileExtension = (type: string) => {
  return mime.getExtension(type) || "png";
};

const saveFiles = async (
  files: {
    mimeType: string;
    type: string;
    data: string;
  }[],
  options: { dataDir: string },
) => {
  return await Promise.all(
    files.map(async (file) => {
      if (!isBase64(file.data)) return file;

      const folder = path.join("files", dayjs().format("YYYY-MM-DD"));
      const folderWithDataDir = path.join(options.dataDir, folder);
      if (!existsSync(folderWithDataDir)) {
        mkdirSync(folderWithDataDir, { recursive: true });
      }

      const ext = getFileExtension(file.mimeType || "png");
      const id = v7();
      const filename = ext ? `${id}.${ext}` : id;

      const imagePath = path.join(folderWithDataDir, filename);

      await writeFile(imagePath, file.data, "base64");

      return { ...file, data: path.join(folder, filename) };
    }),
  );
};

export default saveFiles;
