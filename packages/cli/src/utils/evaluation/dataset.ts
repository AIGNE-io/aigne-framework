import fs from "node:fs/promises";
import { z } from "zod";
import type { Dataset, DatasetItem } from "./type.ts";

const recordSchema = z.record(z.any());

const datasetItemSchema = z.object({
  id: z.union([z.string(), z.number()]),
  input: recordSchema,
  output: recordSchema.optional(),
  expected: recordSchema.optional(),
  metadata: recordSchema.optional(),
  tags: z.array(z.string()).optional(),
  selected: z.boolean().optional(),
});

const datasetSchema = z.array(datasetItemSchema);

export class FileDataset implements Dataset {
  name = "file-dataset";
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async load(): Promise<DatasetItem[]> {
    let list: string;
    try {
      list = await fs.readFile(this.filePath, "utf-8");
    } catch (err) {
      throw new Error(`Failed to read dataset file: ${err.message}`);
    }

    let parsed: DatasetItem[];
    try {
      parsed = JSON.parse(list);
    } catch (err) {
      throw new Error(`Invalid JSON in dataset file: ${err.message}`);
    }

    const result = await datasetSchema.safeParseAsync(parsed);
    if (!result.success) {
      throw new Error(`Invalid dataset file: ${JSON.stringify(result.error.format())}`);
    }

    return result.data;
  }

  async loadWithOptions(): Promise<DatasetItem[]> {
    return this.load();
  }
}

export class JsonDataset implements Dataset {
  name = "json-dataset";
  private data: DatasetItem[];

  constructor(data: DatasetItem[]) {
    this.data = data;
  }

  async load(): Promise<DatasetItem[]> {
    const result = await datasetSchema.safeParseAsync(this.data);

    if (!result.success) {
      throw new Error(`Invalid dataset file: ${JSON.stringify(result.error.format())}`);
    }

    return result.data;
  }

  async loadWithOptions(): Promise<DatasetItem[]> {
    return this.load();
  }
}
