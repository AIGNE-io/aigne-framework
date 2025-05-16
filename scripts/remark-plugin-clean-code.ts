import type { Code, Root } from "mdast";
import { visit } from "unist-util-visit";
import { extractTestCode, formatCode, removeFunctionCallsFromCode } from "./ts-utils.ts";

const removeExpressions = ["assert", "spyOn", "expect", "mock"];

export default function cleanCode() {
  return async (tree: Root) => {
    const codes: Code[] = [];

    visit(tree, "code", (node) => {
      codes.push(node as Code);
    });

    for (const code of codes) {
      if (code.lang && ["ts", "tsx", "js", "jsx", "typescript", "javascript"].includes(code.lang)) {
        const processedCode = formatCode(
          removeFunctionCallsFromCode(extractTestCode(code.value), removeExpressions),
        ).trim();
        code.value = processedCode;
      }
    }
  };
}
