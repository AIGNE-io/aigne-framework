import type {
  AFSEntry,
  AFSModule,
  AFSRoot,
  AFSSearchOptions,
  AFSWriteEntryPayload,
} from "@aigne/afs";
import { AIAgent, type Context } from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { applyPatch, type Operation } from "fast-json-patch";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { USER_PROFILE_MEMORY_EXTRACTOR_PROMPT } from "./prompt.js";
import { userProfileJsonPathSchema, userProfileSchema } from "./schema.js";

export class UserProfileMemory implements AFSModule {
  constructor(public options: { context: Context }) {}

  moduleId: string = "UserProfileMemory";

  path = "/user-profile-memory";

  _afs?: AFSRoot;

  get afs() {
    if (!this._afs) throw new Error("UserProfileMemory module is not mounted");
    return this._afs;
  }

  extractor: AIAgent<
    { schema: any; profile?: any; entry: AFSEntry },
    z.infer<typeof userProfileJsonPathSchema>
  > = AIAgent.from({
    instructions: USER_PROFILE_MEMORY_EXTRACTOR_PROMPT,
    outputSchema: userProfileJsonPathSchema,
  });

  onMount(afs: AFSRoot): void {
    this._afs = afs;

    afs.on("historyCreated", async ({ entry }) => {
      try {
        await this.updateProfile(entry);
      } catch (error) {
        logger.error("Failed to update user profile memory", error);
      }
    });
  }

  async updateProfile(entry: AFSEntry): Promise<AFSEntry | undefined> {
    const previous = await this._read();

    const { ops } = await this.options.context.newContext({ reset: true }).invoke(this.extractor, {
      schema: zodToJsonSchema(userProfileSchema),
      profile: previous?.content,
      entry,
    });

    const profile = applyPatch(
      previous?.content || {},
      ops.map((op) => {
        if (op.value) op.value = JSON.parse(op.value);
        return op as Operation;
      }),
    ).newDocument;

    return await this._write({ content: profile });
  }

  private async _read(): Promise<AFSEntry | undefined> {
    return this.afs.storage(this).read("/");
  }

  private async _write(entry: AFSWriteEntryPayload): Promise<AFSEntry> {
    return this.afs.storage(this).create({ ...entry, path: "/" });
  }

  async search(
    _path: string,
    _query: string,
    _options?: AFSSearchOptions,
  ): Promise<{ list: AFSEntry[] }> {
    const profile = await this._read();
    return { list: profile ? [profile] : [] };
  }
}
