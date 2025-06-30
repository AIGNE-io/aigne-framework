// Agent 函数：上传 pageTemplate 到 Pages Kit
export default async function Agent({ pageTemplate, locale }) {
  // 固定的 projectId
  const projectId = "5ad33a79-0003-444a-b2ce-92d2cac83119";
  // 构建请求头
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  // 构建请求体
  const raw = JSON.stringify({
    projectId,
    lang: locale,
    pageYaml: pageTemplate,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    // 发送请求到 Pages Kit 接口
    const response = await fetch(
      "https://bbqawfllzdt3pahkdsrsone6p3wpxcwp62vlabtawfu.did.abtnet.io/pages-kit/api/sdk/upload-page",
      requestOptions,
    );
    // 尝试解析为 JSON，失败则返回文本
    try {
      const data = await response.json();
      return { uploadPageResult: data };
    } catch {
      const text = await response.text();
      return { uploadPageResult: text };
    }
  } catch (error) {
    // 捕获并返回错误信息
    return { error: error.message };
  }
}

// 定义输出 schema
Agent.output_schema = {
  type: "object",
  properties: {
    uploadPageResult: {},
    error: { type: "string" },
  },
};

// 函数描述
Agent.description = "上传 pageTemplate 到 Pages Kit，返回接口响应内容";
