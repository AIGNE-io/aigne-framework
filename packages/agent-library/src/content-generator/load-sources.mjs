import { readFile } from "node:fs/promises";

export default async function loadSources({ sources }) {
  const contents = await Promise.all(
    sources.map(async (file) => {
      const content = await readFile(file, "utf8");
      return `// file: ${file}\n${content}`;
    }),
  );
  return {
    datasources: contents.join("\n"),
  };
}

loadSources.input_schema = {
  type: "object",
  properties: {
    sources: {
      type: "array",
      items: { type: "string" },
      description: "Array of paths to the sources files",
    },
  },
  required: ["sources"],
};

loadSources.output_schema = {
  type: "object",
  properties: {
    datasources: {
      type: "string",
      description:
        "Concatenated contents of the sources files, each prefixed with // file: filename",
    },
  },
};
