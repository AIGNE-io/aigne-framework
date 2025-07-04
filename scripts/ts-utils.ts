import { Biome, Distribution } from "@biomejs/js-api";
import { type Node, Project, SyntaxKind } from "ts-morph";

export function removeFunctionCallsFromCode(sourceCode: string, functionName: string[]): string {
  const project = new Project();
  const sourceFile = project.createSourceFile("temp.ts", sourceCode, { overwrite: true });

  for (const e of sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((i) => functionName.includes(i.getExpression().getText()))) {
    if (e?.wasForgotten()) continue;
    const node =
      e.getFirstAncestorByKind(SyntaxKind.VariableStatement) ??
      e.getFirstAncestorByKind(SyntaxKind.ExpressionStatement);
    node?.replaceWithText("");
  }

  return sourceFile.getText();
}

export function removeCommentsFromCode(
  sourceCode: string,
  predict: (comment: Node) => boolean,
): string {
  const project = new Project();
  const sourceFile = project.createSourceFile("temp.ts", sourceCode, { overwrite: true });

  for (const e of sourceFile
    .getDescendantsOfKind(SyntaxKind.SingleLineCommentTrivia)
    .filter(predict)) {
    e.replaceWithText("");
  }

  return sourceFile.getText();
}

const { biome, projectKey } = await Biome.create({
  distribution: Distribution.NODE,
}).then((biome) => {
  const project = biome.openProject();
  biome.applyConfiguration(project.projectKey, {
    formatter: {
      enabled: true,
      indentStyle: "space",
      indentWidth: 2,
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
    assist: {
      enabled: true,
      actions: {
        source: {
          organizeImports: "on",
        },
      },
    },
  });

  return { biome, projectKey: project.projectKey };
});

export function formatCode(code: string): string {
  return biome.formatContent(
    projectKey,
    biome.lintContent(projectKey, code, { fixFileMode: "safeFixes", filePath: "test.ts" }).content,
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

export function extractRegionCode(
  code: string,
  region: string,
  { includeImports = false }: { includeImports?: boolean } = {},
): string {
  const project = new Project();
  const sourceFile = project.createSourceFile("temp.ts", code, { overwrite: true });

  const comments = sourceFile.getDescendantsOfKind(SyntaxKind.SingleLineCommentTrivia);

  const regionStart = comments.find((comment) => comment.getText().endsWith(`#region ${region}`));
  const regionEnd = comments.find((comment) => comment.getText().endsWith(`#endregion ${region}`));

  if (!regionEnd) {
    console.log(
      region,
      code,
      comments.map((i) => i.getText()),
    );
  }

  if (!regionStart) throw new Error(`Cannot find #region ${region}`);
  if (!regionEnd) throw new Error(`Cannot find #endregion ${region}`);

  const startLine = regionStart.getEndLineNumber();
  const endLine = regionEnd.getStartLineNumber() - 1;

  const lines = sourceFile.getFullText().split("\n").slice(startLine, endLine);

  const extractedCode = lines.join("\n");

  if (includeImports) {
    return `${extractImports(code)}\n\n${extractedCode}`.trim();
  }

  return extractedCode;
}

export function extractImports(code: string): string {
  const project = new Project();
  const sourceFile = project.createSourceFile("temp.ts", code, { overwrite: true });

  return sourceFile
    .getImportDeclarations()
    .map((i) => i.getText())
    .join("\n");
}
