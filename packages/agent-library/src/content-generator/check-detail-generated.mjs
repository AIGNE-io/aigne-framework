import { access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AIGNE, TeamAgent } from "@aigne/core";

// 获取当前脚本所在目录
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function checkDetailGenerated({ path, docsDir, ...rest }, options) {
  // 检查详情文件是否已存在
  const relPath = path.replace(/^\//, "");
  const segments = relPath.split("/");
  const fileName = segments.pop();
  const fileFullName = `${fileName}.md`;
  const dir = join(docsDir, ...segments);
  const filePath = join(dir, fileFullName);
  let detailGenerated = true;
  try {
    await access(filePath);
  } catch {
    detailGenerated = false;
  }

  if (detailGenerated) {
    return {
      path,
      docsDir,
      ...rest,
      detailGenerated: true,
    };
  }

  const aigne = await AIGNE.load(__dirname, {
    models: [],
  });

  console.log("checkDetailGenerated agents", aigne.agents);

  const teamAgent = TeamAgent.from({
    name: "generate-detail",
    skills: [
      aigne.agents["transformDetailDatasources"],
      aigne.agents["content-detail-generator"],
      aigne.agents["batch-translate"],
      aigne.agents["saveSingleDoc"],
    ],
  });

  const result = await options.context.invoke(teamAgent, {
    ...rest,
    docsDir,
    path,
  });

  return {
    path,
    docsDir,
    ...rest,
    result,
  };
}
