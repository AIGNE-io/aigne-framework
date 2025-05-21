import { readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import parse from "fenceparser";
import type { Code, Root } from "mdast";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import {
  extractImports,
  extractRegionCode,
  extractTestCode,
  formatCode,
  removeCommentsFromCode,
  removeFunctionCallsFromCode,
} from "./ts-utils.ts";

const removeExpressions = ["assert", "spyOn", "expect", "mock", "detectPort"];

export default function cleanCode() {
  return async (tree: Root, file: VFile) => {
    const codes: Code[] = [];

    visit(tree, "code", (node) => {
      codes.push(node as Code);
    });

    for (const code of codes) {
      const { file: filepath, region, ...meta } = code.meta ? parse(code.meta) : {};

      if (typeof filepath === "string") {
        if (!file.dirname) throw new Error("File dirname is not defined");

        const p = isAbsolute(filepath)
          ? join(process.cwd(), filepath)
          : join(file.dirname, filepath);
        const content = await readFile(p, "utf-8");

        code.value = content;
      }

      if (code.lang && ["ts", "tsx", "js", "jsx", "typescript", "javascript"].includes(code.lang)) {
        const processedCode = formatCode(
          removeCommentsFromCode(
            removeFunctionCallsFromCode(
              typeof region === "string"
                ? extractRegionCode(code.value, region, { includeImports: !meta.exclude_imports })
                : extractTestCode(code.value),
              removeExpressions,
            ),
            (node) => /^\/\/\s*#(region|endregion)/.test(node.getText()),
          ),
        ).trim();

        if (meta.only_imports) {
          code.value = extractImports(processedCode);
        } else {
          code.value = processedCode;
        }
      }
    }
  };
}
