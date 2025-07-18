import { join } from "node:path";
import {
  ListObjectCommand,
  type ListObjectCommandOutput,
  PutObjectCommand,
  SpaceClient,
  type SpaceClientOptionsAuth,
} from "@blocklet/did-space-js";
import { README_EN_CONTENT } from "./readme-contents.js";

/**
 * Manages README files for DID Spaces Memory
 */
export class ReadmeManager {
  private client: SpaceClient;
  private rootDir: string;

  constructor(url: string, auth: SpaceClientOptionsAuth, rootDir: string) {
    this.client = new SpaceClient({ url, auth });
    this.rootDir = rootDir;
  }

  /**
   * Check if a file exists in DID Spaces
   */
  private async exists(key: string): Promise<boolean> {
    try {
      const output: ListObjectCommandOutput = await this.client.send(
        new ListObjectCommand({ key }),
      );
      return output.statusCode === 200;
    } catch {
      return false;
    }
  }

  /**
   * Create README file if it doesn't exist
   */
  private async createReadmeIfNotExists(filename: string, content: string): Promise<void> {
    const filePath = join(this.rootDir, filename);

    if (!(await this.exists(filePath))) {
      await this.client.send(
        new PutObjectCommand({
          key: filePath,
          data: content,
        }),
      );
    }
  }

  /**
   * Initialize all README files
   */
  async initializeReadmeFiles(): Promise<void> {
    await this.createReadmeIfNotExists("README.md", README_EN_CONTENT);
  }
}
