export type LangAttrs = {
  icon?: string;
  foldable?: string; // 是否启用折叠功能
  foldThreshold?: string; // 折叠阈值，超过此行数自动折叠
};

/**
 * 支持解析 markdown 中带参数的 code block, 例如:
 *
 * ```js MyTitle icon='mdi:javascript'
 * console.log('Hello, world!')
 * ```
 *
 * 解析后返回
 * {
 *   lang: 'js',
 *   title: 'MyTitle',
 *   icon: 'material-symbols:javascript'
 * }
 */
export function parseCodeLangStr(lang: string = "") {
  const parts = lang.trim().split(/\s+/);
  const actualLang = parts[0] || "";
  let title = "";
  const attrs: LangAttrs = {};

  if (parts.length > 1) {
    const rest = parts.slice(1);
    const keyValueRegex = /^(\w+)=(.+)$/;

    const titleParts: string[] = [];
    rest.forEach((part) => {
      const match = part.match(keyValueRegex);
      if (match) {
        attrs[match[1]! as keyof LangAttrs] = match[2]!;
      } else {
        titleParts.push(part);
      }
    });

    title = titleParts.join(" ");
  }

  return { lang: actualLang, title, ...attrs };
}
