export async function formatCode(code: string) {
  const prettier = await import("prettier");

  return prettier.format(code, {
    parser: "typescript",
    printWidth: 120,
    useTabs: false,
    tabWidth: 2,
    trailingComma: "es5",
    bracketSameLine: true,
    semi: true,
    singleQuote: true,
  });
}
