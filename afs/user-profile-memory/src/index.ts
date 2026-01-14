import type {
  AFSAccessMode,
  AFSEntry,
  AFSListOptions,
  AFSListResult,
  AFSModule,
  AFSModuleLoadParams,
  AFSOperationOptions,
  AFSReadResult,
  AFSRoot,
  AFSSearchOptions,
  AFSSearchResult,
  AFSWriteEntryPayload,
  AFSWriteResult,
} from "@aigne/afs";
import {
  type AFSStorage,
  SharedAFSStorage,
  type SharedAFSStorageOptions,
} from "@aigne/afs-history";
import { AIAgent, type Context } from "@aigne/core";
import { camelizeSchema, optionalize } from "@aigne/core/loader/schema.js";
import { logger } from "@aigne/core/utils/logger.js";
import { v7 } from "@aigne/uuid";
import { applyPatch, type Operation } from "fast-json-patch";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { USER_PROFILE_MEMORY_EXTRACTOR_PROMPT } from "./prompt.js";
import { userProfileJsonPathSchema, userProfileSchema } from "./schema.js";

export interface UserProfileMemoryOptions {
  storage?: SharedAFSStorage | SharedAFSStorageOptions;
  description?: string;
  /**
   * Access mode for this module.
   * @default "readwrite"
   */
  accessMode?: AFSAccessMode;
}

const DEFAULT_DESCRIPTION = `\
User Profile Memory: This contains structured information about the user that has been \
automatically extracted from previous conversations. It includes personal details such as name, \
location, interests, family members, projects, and other relevant information the user has shared. \
Use this memory to personalize responses and maintain context about the user across conversations. \
The profile is continuously updated as new information is learned.
`;

const userProfileMemoryOptionsSchema = camelizeSchema(
  z.object({
    description: optionalize(z.string().describe("Description of the user profile memory")),
    accessMode: optionalize(
      z.enum(["readonly", "readwrite"]).describe("Access mode for this module"),
    ),
  }),
);

export class UserProfileMemory implements AFSModule {
  static schema() {
    return userProfileMemoryOptionsSchema;
  }

  static async load({ parsed }: AFSModuleLoadParams) {
    const valid = await UserProfileMemory.schema().passthrough().parseAsync(parsed);
    return new UserProfileMemory(valid);
  }

  constructor(public options: UserProfileMemoryOptions) {
    this.storage =
      options?.storage instanceof SharedAFSStorage
        ? options.storage.withModule(this)
        : new SharedAFSStorage(options?.storage).withModule(this);

    this.description = options.description || DEFAULT_DESCRIPTION;
    this.accessMode = options.accessMode ?? "readwrite";
  }

  private storage: AFSStorage;

  readonly name: string = "user-profile-memory";

  readonly accessMode: AFSAccessMode;

  description?: string | undefined;

  extractor: AIAgent<
    { schema: any; profile?: any; entry: AFSEntry },
    z.infer<typeof userProfileJsonPathSchema>
  > = AIAgent.from({
    instructions: USER_PROFILE_MEMORY_EXTRACTOR_PROMPT,
    outputSchema: userProfileJsonPathSchema,
  });

  onMount(afs: AFSRoot): void {
    afs.on("historyCreated", async ({ entry }, options) => {
      try {
        await this.updateProfile(entry, options);
      } catch (error) {
        logger.error("Failed to update user profile memory", error);
      }
    });
  }

  async updateProfile(entry: AFSEntry, options?: AFSOperationOptions) {
    const { data: previous } = await this.read("/");

    if (typeof (options?.context as Context)?.newContext !== "function") {
      throw new Error("Context is not valid for user profile extraction");
    }

    const { ops } = await (options?.context as Context)
      .newContext({ reset: true })
      .invoke(this.extractor, {
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

  async list(_path: string, _options?: AFSListOptions): Promise<AFSListResult> {
    const { data: profile } = await this.read("/");
    return { data: profile ? [profile] : [] };
  }

  async read(path: string): Promise<AFSReadResult> {
    if (path !== "/") return {};

    const data = (
      await this.storage.list({
        orderBy: [["createdAt", "desc"]],
        limit: 1,
      })
    ).data.at(0);
    if (data) data.description = this.description;
    return { data };
  }

  async write(path: string, entry: AFSWriteEntryPayload): Promise<AFSWriteResult> {
    const { data: previous } = await this.read("/");
    const data = await this.storage.create({
      ...previous,
      ...entry,
      id: previous?.id || v7(),
      path,
    });
    if (data) data.description = this.description;
    return { data };
  }

  async search(
    _path: string,
    _query: string,
    _options?: AFSSearchOptions,
  ): Promise<AFSSearchResult> {
    const { data: profile } = await this.read("/");
    return { data: profile ? [profile] : [] };
  }
}
