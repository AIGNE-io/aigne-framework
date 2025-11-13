import {
  type AFSEntry,
  type AFSListOptions,
  type AFSModule,
  type AFSRoot,
  type AFSSearchOptions,
  type AFSStorage,
  type AFSWriteEntryPayload,
  SharedAFSStorage,
  type SharedAFSStorageOptions,
} from "@aigne/afs";
import { AIAgent, type Context } from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { applyPatch, type Operation } from "fast-json-patch";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { USER_PROFILE_MEMORY_EXTRACTOR_PROMPT } from "./prompt.js";
import { userProfileJsonPathSchema, userProfileSchema } from "./schema.js";

export interface UserProfileMemoryOptions {
  context: Context;
  storage?: SharedAFSStorage | SharedAFSStorageOptions;
  description?: string;
}

const DEFAULT_DESCRIPTION = `\
User Profile Memory: This contains structured information about the user that has been \
automatically extracted from previous conversations. It includes personal details such as name, \
location, interests, family members, projects, and other relevant information the user has shared. \
Use this memory to personalize responses and maintain context about the user across conversations. \
The profile is continuously updated as new information is learned.
`;

export class UserProfileMemory implements AFSModule {
  constructor(public options: UserProfileMemoryOptions) {
    this.storage =
      options?.storage instanceof SharedAFSStorage
        ? options.storage.withModule(this)
        : new SharedAFSStorage(options?.storage).withModule(this);

    this.description = options.description || DEFAULT_DESCRIPTION;
  }

  private storage: AFSStorage;

  readonly name: string = "user-profile-memory";

  description?: string | undefined;

  extractor: AIAgent<
    { schema: any; profile?: any; entry: AFSEntry },
    z.infer<typeof userProfileJsonPathSchema>
  > = AIAgent.from({
    instructions: USER_PROFILE_MEMORY_EXTRACTOR_PROMPT,
    outputSchema: userProfileJsonPathSchema,
  });

  onMount(afs: AFSRoot): void {
    afs.on("historyCreated", async ({ entry }) => {
      try {
        await this.updateProfile(entry);
      } catch (error) {
        logger.error("Failed to update user profile memory", error);
      }
    });
  }

  private async updateProfile(entry: AFSEntry) {
    const { result: previous } = await this.read("/");

    const { ops } = await this.options.context.newContext({ reset: true }).invoke(this.extractor, {
      schema: zodToJsonSchema(userProfileSchema),
      profile: previous?.content,
      entry,
    });

    const profile = applyPatch(
      previous?.content || {},
      ops.map((op) => {
        const value = typeof op.value === "string" && op.value ? JSON.parse(op.value) : op.value;
        return { ...op, value } as Operation;
      }),
    ).newDocument;

    return await this.write("/", { content: profile });
  }

  async list(
    _path: string,
    _options?: AFSListOptions,
  ): Promise<{ list: AFSEntry[]; message?: string }> {
    const { result: profile } = await this.read("/");
    return { list: profile ? [profile] : [] };
  }

  async read(path: string): Promise<{ result: AFSEntry | undefined }> {
    const result = await this.storage.read(path);
    if (result) result.description = this.description;
    return { result };
  }

  async write(path: string, entry: AFSWriteEntryPayload): Promise<{ result: AFSEntry }> {
    const result = await this.storage.create({ ...entry, path });
    if (result) result.description = this.description;
    return { result };
  }

  async search(
    _path: string,
    _query: string,
    _options?: AFSSearchOptions,
  ): Promise<{ list: AFSEntry[] }> {
    const { result: profile } = await this.read("/");
    return { list: profile ? [profile] : [] };
  }
}
