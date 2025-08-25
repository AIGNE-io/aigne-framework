import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import YAML from "yaml";
import { MEDIA_KIT_DID } from "../constants.js";
import { getComponentMountPoint } from "./get-component-mount-point.js";

export interface UploadFilesOptions {
  appUrl: string;
  mediaFolder: string;
  mediaFiles: string[];
  concurrency?: number;
  accessToken: string;
  cacheFilePath?: string;
}

export interface UploadResult {
  originalUrl: string;
  diskUrl: string;
  url: string;
}

export interface UploadFilesResult {
  results: UploadResult[];
}

interface CacheEntry {
  local_path: string;
  url: string;
}

type UploadCache = Record<string, CacheEntry>;

function loadCache(cacheFilePath: string): UploadCache {
  if (!fs.existsSync(cacheFilePath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(cacheFilePath, "utf-8");
    if (!content.trim()) {
      return {};
    }

    const parsedData = YAML.parse(content);
    return parsedData || {};
  } catch (error) {
    console.warn(`Failed to load cache file: ${error}`);
    return {};
  }
}

function saveCache(cacheFilePath: string, cache: UploadCache): void {
  try {
    const yamlContent = YAML.stringify(cache, {
      lineWidth: 0,
    });

    fs.writeFileSync(cacheFilePath, yamlContent, "utf-8");
  } catch (error) {
    console.warn(`Failed to save cache file: ${error}`);
  }
}

export async function uploadFiles(options: UploadFilesOptions): Promise<UploadFilesResult> {
  const { appUrl, mediaFolder, mediaFiles, concurrency = 5, accessToken, cacheFilePath } = options;

  // Load cache if provided
  let cache: UploadCache = {};
  if (cacheFilePath) {
    cache = loadCache(cacheFilePath);
  }

  const urlMap = new Map<string, string>();
  for (const url of mediaFiles) {
    const filename = path.basename(url);
    urlMap.set(filename, url);
  }

  const files = fs.readdirSync(mediaFolder);

  const filesToUpload = files.filter((file) => {
    const baseFilename = path.basename(file, path.extname(file));
    const isMatch = urlMap.has(baseFilename);
    return isMatch;
  });
  console.log(`Files to upload: ${filesToUpload.length}`, filesToUpload);

  const results: UploadResult[] = mediaFiles.map((url) => ({
    originalUrl: url,
    diskUrl: "",
    url: "",
  }));

  if (filesToUpload.length === 0) {
    return { results };
  }

  const url = new URL(appUrl);
  const mountPoint = await getComponentMountPoint(appUrl, MEDIA_KIT_DID);
  const uploadEndpoint = `${url.origin}${mountPoint}/api/uploads`;
  console.log(`Upload endpoint: ${uploadEndpoint}`);

  const limit = pLimit(concurrency);

  const uploadPromises = filesToUpload.map((file) =>
    limit(async () => {
      const filePath = path.join(mediaFolder, file);
      const baseFilename = path.basename(file, path.extname(file));
      const originalUrl = urlMap.get(baseFilename);

      if (!originalUrl) {
        console.error(`No matching URL found for file: ${file}`);
        return null;
      }

      console.log(
        `Processing file: ${file}, baseFilename: ${baseFilename}, originalUrl: ${originalUrl}`,
      );

      try {
        const fileBuffer = fs.readFileSync(filePath);
        const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

        // Check cache first
        if (cacheFilePath && cache[fileHash]) {
          console.log(`Cache hit for ${file}, using cached URL: ${cache[fileHash].url}`);
          const resultIndex = results.findIndex((r) => r.originalUrl === originalUrl);
          if (resultIndex !== -1) {
            results[resultIndex] = {
              originalUrl,
              diskUrl: filePath,
              url: cache[fileHash].url,
            };
          }
          return {
            originalUrl,
            diskUrl: filePath,
            url: cache[fileHash].url,
          };
        }

        const stats = fs.statSync(filePath);
        const fileSize = stats.size;
        const fileExt = path.extname(file).substring(1);
        const mimeType = getMimeType(file);

        const uploaderId = "Uploader";
        const fileId = `${uploaderId}-${baseFilename.toLowerCase().replace(/[^a-z0-9]/g, "")}-${fileHash.substring(0, 16)}`;

        const metadata = {
          uploaderId,
          relativePath: `${baseFilename}.${fileExt}`,
          name: `${baseFilename}.${fileExt}`,
          type: mimeType,
          filetype: mimeType,
          filename: `${baseFilename}.${fileExt}`,
        };

        const encodedMetadata = Object.entries(metadata)
          .map(([key, value]) => `${key} ${Buffer.from(value).toString("base64")}`)
          .join(",");

        console.log(`Starting upload for ${file}...`);

        const createResponse = await fetch(uploadEndpoint, {
          method: "POST",
          headers: {
            "Tus-Resumable": "1.0.0",
            "Upload-Length": fileSize.toString(),
            "Upload-Metadata": encodedMetadata,
            Cookie: `login_token=${accessToken}`,
            "x-uploader-file-name": `${baseFilename}.${fileExt}`,
            "x-uploader-file-id": fileId,
            "x-uploader-file-ext": fileExt,
            "x-uploader-base-url": `${mountPoint}/api/uploads`,
            "x-uploader-endpoint-url": uploadEndpoint,
            "x-uploader-metadata": JSON.stringify({
              uploaderId: "Uploader",
              relativePath: `${baseFilename}.${fileExt}`,
              name: `${baseFilename}.${fileExt}`,
              type: mimeType,
            }),
            "x-component-did": "z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu",
          },
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(
            `Failed to create upload: ${createResponse.status} ${createResponse.statusText}\n${errorText}`,
          );
        }

        const uploadUrl = createResponse.headers.get("Location");
        if (!uploadUrl) {
          throw new Error("No upload URL received from server");
        }

        console.log(`Upload created at ${uploadUrl}`);
        const uploadResponse = await fetch(`${url.origin}${uploadUrl}`, {
          method: "PATCH",
          headers: {
            "Tus-Resumable": "1.0.0",
            "Upload-Offset": "0",
            "Content-Type": "application/offset+octet-stream",
            Cookie: `login_token=${accessToken}`,
            "x-uploader-file-name": `${baseFilename}.${fileExt}`,
            "x-uploader-file-id": fileId,
            "x-uploader-file-ext": fileExt,
            "x-uploader-base-url": `${mountPoint}/api/uploads`,
            "x-uploader-endpoint-url": uploadEndpoint,
            "x-uploader-metadata": JSON.stringify({
              uploaderId: "Uploader",
              relativePath: `${baseFilename}.${fileExt}`,
              name: `${baseFilename}.${fileExt}`,
              type: mimeType,
            }),
            "x-component-did": "z8ia1WEiBZ7hxURf6LwH21Wpg99vophFwSJdu",
            "x-uploader-file-exist": "true",
          },
          body: fileBuffer,
        });
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(
            `Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}\n${errorText}`,
          );
        }

        const uploadResult = await uploadResponse.json();
        const uploadedFileUrl = uploadResult.url;
        if (!uploadedFileUrl) {
          throw new Error("No URL found in the upload response");
        }
        console.log(`File ${file} uploaded successfully: ${uploadedFileUrl}`);

        // Update cache
        if (cacheFilePath) {
          cache[fileHash] = {
            local_path: file,
            url: uploadedFileUrl,
          };
        }

        const resultIndex = results.findIndex((r) => r.originalUrl === originalUrl);
        if (resultIndex !== -1) {
          results[resultIndex] = {
            originalUrl,
            diskUrl: filePath,
            url: uploadedFileUrl,
          };
        }

        return {
          originalUrl,
          diskUrl: filePath,
          url: uploadedFileUrl,
        };
      } catch (error) {
        console.error(`Error uploading ${file}:`, error);
        return {
          originalUrl,
          diskUrl: filePath,
          url: "",
        };
      }
    }),
  );

  await Promise.all(uploadPromises);

  // Save cache if provided
  if (cacheFilePath) {
    saveCache(cacheFilePath, cache);
  }

  return { results };
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".txt": "text/plain",
    ".json": "application/json",
    ".xml": "application/xml",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".7z": "application/x-7z-compressed",
  };

  return mimeTypes[ext] || "application/octet-stream";
}
