import { Biome, Distribution } from "@biomejs/js-api";
import { Project, SyntaxKind } from "ts-morph";

export function removeFunctionCallsFromCode(sourceCode: string, functionName: string[]): string {
  const project = new Project();
  const sourceFile = project.createSourceFile("temp.ts", sourceCode, { overwrite: true });

  for (const e of sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((i) => functionName.includes(i.getExpression().getText()))) {
    (
      e.getFirstAncestorByKind(SyntaxKind.VariableStatement) ??
      e.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)
    )?.replaceWithText("");
  }

  return sourceFile.getText();
}

const biome = await Biome.create({
  distribution: Distribution.NODE,
}).then((biome) => {
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

  return biome;
});

export function formatCode(code: string): string {
  return biome.formatContent(
    biome.lintContent(code, { fixFileMode: "SafeFixes", filePath: "test.ts" }).content,
    { filePath: "test.ts" },
  ).content;
}

export function extractTestCode(code: string): string {
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
