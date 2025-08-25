import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pLimit from "p-limit";
import YAML from "yaml";
import { MEDIA_KIT_DID } from "../constants.js";
import { getComponentMountPoint } from "./get-component-mount-point.js";

export interface UploadFilesOptions {
  appUrl: string;
  filePaths: string[]; // Array of absolute file paths to upload
  concurrency?: number;
  accessToken: string;
  cacheFilePath?: string;
}

export interface UploadResult {
  filePath: string; // The local file path that was uploaded
  url: string; // The uploaded URL
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
  const { appUrl, filePaths, concurrency = 5, accessToken, cacheFilePath } = options;

  // Load cache if provided
  let cache: UploadCache = {};
  if (cacheFilePath) {
    cache = loadCache(cacheFilePath);
  }

  console.log(`Files to upload: ${filePaths.length}`, filePaths);

  const results: UploadResult[] = [];

  if (filePaths.length === 0) {
    return { results };
  }

  const url = new URL(appUrl);
  const mountPoint = await getComponentMountPoint(appUrl, MEDIA_KIT_DID);
  const uploadEndpoint = `${url.origin}${mountPoint}/api/uploads`;
  console.log(`Upload endpoint: ${uploadEndpoint}`);

  const limit = pLimit(concurrency);

  const uploadPromises = filePaths.map((filePath) =>
    limit(async () => {
      const filename = path.basename(filePath);
      const baseFilename = path.basename(filePath, path.extname(filePath));

      console.log(`Processing file: ${filename} at ${filePath}`);

      try {
        const fileBuffer = fs.readFileSync(filePath);
        const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

        // Check cache first
        if (cacheFilePath && cache[fileHash]) {
          console.log(`Cache hit for ${filename}, using cached URL: ${cache[fileHash].url}`);
          return {
            filePath,
            url: cache[fileHash].url,
          };
        }

        const stats = fs.statSync(filePath);
        const fileSize = stats.size;
        const fileExt = path.extname(filePath).substring(1);
        const mimeType = getMimeType(filePath);

        // Use hash-based filename to avoid encoding issues with non-ASCII characters
        const hashBasedFilename = `${fileHash.substring(0, 16)}.${fileExt}`;

        const uploaderId = "Uploader";
        const fileId = `${uploaderId}-${baseFilename.toLowerCase().replace(/[^a-z0-9]/g, "")}-${fileHash.substring(0, 16)}`;

        // Metadata for TUS protocol (will be base64 encoded)
        const tusMetadata = {
          uploaderId,
          relativePath: hashBasedFilename,
          name: hashBasedFilename,
          type: mimeType,
          filetype: mimeType,
          filename: hashBasedFilename,
        };

        const encodedMetadata = Object.entries(tusMetadata)
          .map(([key, value]) => `${key} ${Buffer.from(value).toString("base64")}`)
          .join(",");

        console.log(`Starting upload for ${filename} -> ${hashBasedFilename}...`);

        const createResponse = await fetch(uploadEndpoint, {
          method: "POST",
          headers: {
            "Tus-Resumable": "1.0.0",
            "Upload-Length": fileSize.toString(),
            "Upload-Metadata": encodedMetadata,
            Cookie: `login_token=${accessToken}`,
            "x-uploader-file-name": hashBasedFilename,
            "x-uploader-file-id": fileId,
            "x-uploader-file-ext": fileExt,
            "x-uploader-base-url": `${mountPoint}/api/uploads`,
            "x-uploader-endpoint-url": uploadEndpoint,
            "x-uploader-metadata": JSON.stringify({
              uploaderId: "Uploader",
              relativePath: hashBasedFilename,
              name: hashBasedFilename,
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
            "x-uploader-file-name": hashBasedFilename,
            "x-uploader-file-id": fileId,
            "x-uploader-file-ext": fileExt,
            "x-uploader-base-url": `${mountPoint}/api/uploads`,
            "x-uploader-endpoint-url": uploadEndpoint,
            "x-uploader-metadata": JSON.stringify({
              uploaderId: "Uploader",
              relativePath: hashBasedFilename,
              name: hashBasedFilename,
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
        console.log(
          `File ${filename} -> ${hashBasedFilename} uploaded successfully: ${uploadedFileUrl}`,
        );

        // Update cache
        if (cacheFilePath) {
          cache[fileHash] = {
            local_path: path.relative(process.cwd(), filePath),
            url: uploadedFileUrl,
          };
        }

        return {
          filePath,
          url: uploadedFileUrl,
        };
      } catch (error) {
        console.error(`Error uploading ${filename}:`, error);
        return {
          filePath,
          url: "",
        };
      }
    }),
  );

  const uploadResults = await Promise.all(uploadPromises);

  // Filter out null results and add to final results
  results.push(...uploadResults.filter((result): result is UploadResult => result !== null));

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
