<p align="center">
  <img src="./screenshots/logo.svg" alt="AIGNE Logo" width="400"/>
</p>

<p align="center">
  🇬🇧 <a href="./README.md">English</a> | 🇨🇳 <a href="./README.zh.md">中文</a>
</p>

# AIGNE 监视器

基于 OpenTelemetry 构建的 Agent 数据流监控可视化工具。支持收集 Trace 和 Log 数据。可作为独立服务使用，也可集成到 AIGNE 运行时中（AIGNE 默认已集成该模块）。

![](./screenshots/list.png)
![](./screenshots/detail.png)

## UI 的使用方式

AIGNE 监视器 UI 组件

```jsx
import List from "@aigne/observability-ui/list";

function App () {
  return <List/>
}
```