import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import mime from "mime";
import { parseURL } from "ufo";
import { v7 } from "uuid";
import { z } from "zod";
import { optionalize } from "../loader/schema.js";
import { pick } from "../utils/type-utils.js";
import { Agent, type AgentInvokeOptions, type Message } from "./agent.js";

export abstract class Model<I extends Message = any, O extends Message = any> extends Agent<I, O> {
  async transformFileType(
    fileType: "file",
    data: FileUnionContent,
    options: AgentInvokeOptions,
  ): Promise<FileContent>;
  async transformFileType(
    fileType: "local" | undefined,
    data: FileUnionContent,
    options: AgentInvokeOptions,
  ): Promise<LocalContent>;
  async transformFileType(
    fileType: FileType | undefined,
    data: FileUnionContent,
    options: AgentInvokeOptions,
  ): Promise<FileUnionContent>;
  async transformFileType(
    fileType: FileType | undefined = "local",
    data: FileUnionContent,
    options: AgentInvokeOptions,
  ): Promise<FileUnionContent> {
    if (fileType === data.type) return data;

    const common = pick(data, "filename", "mimeType");

    switch (fileType) {
      case "local": {
        const dir = nodejs.path.join(nodejs.os.tmpdir(), options.context.id);
        await nodejs.fs.mkdir(dir, { recursive: true });

        const ext = Model.getFileExtension(data.mimeType || data.filename || "");
        const id = v7();
        const filename = ext ? `${id}.${ext}` : id;
        const path = nodejs.path.join(dir, filename);
        let mimeType = data.mimeType;

        if (data.type === "file") {
          await nodejs.fs.writeFile(path, data.data, "base64");
          mimeType ||= Model.getMimeType(data.filename || "");
        } else if (data.type === "url") {
          await this.downloadFile(data.url)
            .then((res) => res.body)
            .then((body) => body && nodejs.fs.writeFile(path, body));
          mimeType ||= Model.getMimeType(data.filename || parseURL(data.url).pathname);
        } else {
          throw new Error(`Unexpected file type: ${data.type}`);
        }

        return { ...common, type: "local", path, mimeType };
      }
      case "file": {
        let base64: string;
        let mimeType = data.mimeType;

        if (data.type === "local") {
          base64 = await nodejs.fs.readFile(data.path, "base64");
          mimeType ||= Model.getMimeType(data.filename || data.path);
        } else if (data.type === "url") {
          base64 = Buffer.from(await (await this.downloadFile(data.url)).arrayBuffer()).toString(
            "base64",
          );
          mimeType ||= Model.getMimeType(data.filename || parseURL(data.url).pathname);
        } else {
          throw new Error(`Unexpected file type: ${data.type}`);
        }

        return { ...common, type: "file", data: base64, mimeType };
      }
    }
  }

  static getFileExtension(type: string) {
    return mime.getExtension(type) || undefined;
  }

  static getMimeType(filename: string) {
    return mime.getType(filename) || undefined;
  }

  async downloadFile(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text().catch(() => null);
      throw new Error(
        `Failed to download content from ${url}, ${response.status} ${response.statusText} ${text}`,
      );
    }

    return response;
  }
}

export type FileType = "local" | "file";

export const fileTypeSchema = z.enum(["local", "file"]);

export interface FileContentBase {
  filename?: string;
  mimeType?: string;
}

export const fileContentBaseSchema = z.object({
  filename: optionalize(z.string()),
  mimeType: optionalize(z.string()),
});

export interface UrlContent extends FileContentBase {
  type: "url";
  url: string;
}

export const urlContentSchema = fileContentBaseSchema.extend({
  type: z.literal("url"),
  url: z.string(),
});

export interface FileContent extends FileContentBase {
  type: "file";
  data: string;
}

export const fileContentSchema = fileContentBaseSchema.extend({
  type: z.literal("file"),
  data: z.string(),
});

export interface LocalContent extends FileContentBase {
  type: "local";
  path: string;
}

export const localContentSchema = fileContentBaseSchema.extend({
  type: z.literal("local"),
  path: z.string(),
});

export type FileUnionContent = LocalContent | UrlContent | FileContent;

export const fileUnionContentSchema = z.discriminatedUnion("type", [
  localContentSchema,
  urlContentSchema,
  fileContentSchema,
]);

export const fileUnionContentsSchema = z.union([
  fileUnionContentSchema,
  z.array(fileUnionContentSchema),
]);
