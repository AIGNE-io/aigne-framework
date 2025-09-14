import {
  type AFSEntry,
  type AFSModule,
  type AFSRoot,
  type AFSSearchOptions,
  type AFSWriteEntryPayload,
  AIAgent,
  type Context,
} from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import type { z } from "zod";
import { USER_PROFILE_MEMORY_EXTRACTOR_PROMPT } from "./prompt.js";
import { userProfileSchema } from "./schema.js";

export class UserProfileMemory implements AFSModule {
  moduleId: string = "UserProfileMemory";

  path = "/user-profile-memory";

  _afs?: AFSRoot;

  get afs() {
    if (!this._afs) throw new Error("UserProfileMemory module is not mounted");
    return this._afs;
  }

  extractor: AIAgent<{ profile?: any; entry: AFSEntry }, z.infer<typeof userProfileSchema>> =
    AIAgent.from({
      instructions: USER_PROFILE_MEMORY_EXTRACTOR_PROMPT,
      outputSchema: userProfileSchema,
    });

  onMount(afs: AFSRoot): void {
    this._afs = afs;

    afs.on("historyCreated", async ({ context, entry }) => {
      try {
        await this.updateProfile(context, entry);
      } catch (error) {
        logger.error("Failed to update user profile memory", error);
      }
    });
  }

  private async updateProfile(context: Context, entry: AFSEntry): Promise<AFSEntry | undefined> {
    const previous = await this._read();

    const profile = await context.newContext({ reset: true }).invoke(this.extractor, {
      profile: previous?.content,
      entry,
    });

    if (!profile.updated) return previous;

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
