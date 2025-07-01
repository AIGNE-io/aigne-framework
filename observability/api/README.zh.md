<p align="center">
  <img src="./logo.svg" alt="AIGNE Logo" width="400"/>
</p>

<p align="center">
  🇬🇧 <a href="./README.md">English</a> | 🇨🇳 <a href="./README.zh.md">中文</a>
</p>

# AIGNE 监视器

基于 OpenTelemetry 构建的 Agent 数据流监控可视化工具。支持收集 Trace 和 Log 数据。可作为独立服务使用，也可集成到 AIGNE 运行时中（AIGNE 默认已集成该模块）。

![](./screenshots/list.png)
![](./screenshots/detail.png)

---

## 🧩 API 用法

AIGNE 监视器支持以代码方式集成到你的 Node.js 应用中，暴露了两种 server 启动方式：

### 1. Blocklet/服务端模式

适用于 Blocklet 部署或需要以服务方式运行的场景。

```js
import { startServer as startObservabilityBlockletServer } from "@aigne/observability-api/server";

startObservabilityBlockletServer({
  port: Number(process.env.BLOCKLET_PORT) || 3000,
  dbUrl: path.join("file:", process.env.BLOCKLET_DATA_DIR || "", "observer.db"),
});
```

### 2. CLI/本地开发模式

适用于本地开发、调试或通过 CLI 启动的场景。

```js
import { startObservabilityCLIServer } from "@aigne/observability-api/cli";

startObservabilityCLIServer({
  port: 7890,
  dbUrl: "file:observer.db",
});
```

- Blocklet/服务端模式更适合生产环境和平台集成，支持更丰富的配置和认证。
- CLI/本地开发模式更轻量，适合开发者本地体验和调试。

如需详细参数和高级用法，请参考源码或 TS 类型定义。
