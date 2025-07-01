<p align="center">
  <img src="../../logo.svg" alt="AIGNE Logo" width="400"/>
</p>

<p align="center">
  🇬🇧 <a href="./README.md">English</a> | 🇨🇳 <a href="./README.zh.md">中文</a>
</p>

# AIGNE 监视器

基于 OpenTelemetry 构建的 Agent 数据流监控可视化工具。支持收集 Trace 和 Log 数据。可作为独立服务使用，也可集成到 AIGNE 运行时中（AIGNE 默认已集成该模块）。

![](./screenshots/list.png)
![](./screenshots/detail.png)

---

## ✨ 特性

- 📊 实时可视化追踪数据和调用链
- 🔍 精确定位 AIGNE 内部工作流程
- ☁️ 支持本地 [AIGNE CLI](https://www.npmjs.com/package/@aigne/cli) 和 [Blocklet](https://store.blocklet.dev/blocklets/z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh) 部署

---

## 🛠 安装与使用

您可以通过两种方式使用 AIGNE 监视器：**AIGNE CLI** 或 **Blocklet**。

### 通过 AIGNE CLI 使用

```bash
npm install -g @aigne/cli

# 启动监视器
aigne observe
```

启动后，您可以在浏览器中访问 `http://localhost:7890` 查看监视器界面。

### 运行示例

运行示例 AIGNE 应用时，可以在 AIGNE 监视器中事实查看 Agents 的数据流和调用链。如下运行 chat-bot 示例：

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # 设置你的 OpenAI API 密钥

# One-shot 模式运行
npx -y @aigne/example-chat-bot

# 或者加入 `--chat` 参数进入交互式聊天模式
npx -y @aigne/example-chat-bot --chat
```

查看[更多示例](../../examples/README.zh.md)

### 作为 Blocklet 使用

安装 [AIGNE Observability Blocklet](https://store.blocklet.dev/blocklets/z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh) 后，您可以直接在 Blocklet 环境中使用 AIGNE 监视器。所有使用 AIGNE Framework 的 Blocklet 都会自动集成监视器功能。
