import { Biome, Distribution } from "@biomejs/js-api";
import type { Code, Root } from "mdast";
import { Project, SyntaxKind } from "ts-morph";
import { visit } from "unist-util-visit";

const removeExpressions = ["assert", "spyOn", "expect", "mock"];

export default function cleanCode() {
  return async (tree: Root) => {
    const codes: Code[] = [];

    visit(tree, "code", (node) => {
      codes.push(node as Code);
    });

    for (const code of codes) {
      if (code.lang && ["ts", "tsx", "js", "jsx", "typescript", "javascript"].includes(code.lang)) {
        const processedCode = (
          await formatCode(
            removeFunctionCallsFromCode(extractTestCode(code.value), removeExpressions),
          )
        ).trim();
        code.value = processedCode;
      }
    }
  };
}

function extractTestCode(code: string): string {
  const project = new Project();
  const sourceFile = project.createSourceFile("temp.ts", code, { overwrite: true });

  const testCalls = sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((expr) => expr.getExpression().getText() === "test");

  for (const testCall of testCalls) {
    const body = testCall.getArguments()[1]?.asKind(SyntaxKind.ArrowFunction)?.getBody();

    if (body?.isKind(SyntaxKind.Block)) {
      const code = body.getText().trim().slice(1, -1).trim();
      testCall.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)?.replaceWithText(code);
    }
  }

  return sourceFile.getText();
}

function removeFunctionCallsFromCode(sourceCode: string, functionName: string[]): string {
  const project = new Project();
  const sourceFile = project.createSourceFile("temp.ts", sourceCode, { overwrite: true });

  for (const e of sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((i) => functionName.includes(i.getExpression().getText()))) {
    e.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)?.replaceWithText("");
  }

  return sourceFile.getText();
}

const biome = await Biome.create({
  distribution: Distribution.NODE,
});

biome.applyConfiguration({
  formatter: {
    enabled: true,
    indentStyle: "space",
    indentWidth: 2,
  },
  organizeImports: {
    enabled: true,
  },
  linter: {
    enabled: true,
    rules: {
      recommended: true,
      correctness: {
        noUnusedVariables: "error",
        noUnusedImports: "error",
        noUnusedFunctionParameters: "error",
        noUnusedPrivateClassMembers: "error",
      },
    },
  },
});

async function formatCode(code: string): Promise<string> {
  return biome.formatContent(
    biome.lintContent(code, { fixFileMode: "SafeFixes", filePath: "test.ts" }).content,
    { filePath: "test.ts" },
  ).content;
}
