import { readFile } from "node:fs/promises";

export default async function loadSources({ sources, examples }) {
  const sourcesFile = await readFile(sources, "utf8");
  const examplesFile = await readFile(examples, "utf8");

  return {
    sources: [`// file: ${sources}`, sourcesFile].join("\n"),
    examples: [`// file: ${examples}`, examplesFile].join("\n"),
  };
}

loadSources.input_schema = {
  type: "object",
  properties: {
    sources: {
      type: "string",
      description: "Path to the sources file",
    },
    examples: {
      type: "string",
      description: "Path to the examples file",
    },
  },
  required: ["sources", "examples"],
};

loadSources.output_schema = {
  type: "object",
  properties: {
    sources: {
      type: "string",
      description: "Contents of the sources file",
    },
    examples: {
      type: "string",
      description: "Contents of the examples file",
    },
  },
  required: ["sources", "examples"],
};
