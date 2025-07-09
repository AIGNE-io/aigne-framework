export function processContent({ content }) {
  // 匹配 markdown 普通链接 [text](link)，排除图片 ![text](link)
  return content.replace(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g, (match, text, link) => {
    // 排除外部链接和 mailto
    if (/^(https?:\/\/|mailto:)/.test(link)) return match;
    // 保留锚点
    const [path, hash] = link.split("#");
    // 已有扩展名则跳过
    if (/\.[a-zA-Z0-9]+$/.test(path)) return match;
    // 只处理相对路径或以 / 开头的路径
    if (!path || path.startsWith(".")) return match;
    // 构造新链接
    let newPath = path.startsWith("/") ? path.slice(1) : path;
    newPath = `./${newPath}.md`;
    const newLink = hash ? `${newPath}#${hash}` : newPath;
    return `[${text}](${newLink})`;
  });
}
