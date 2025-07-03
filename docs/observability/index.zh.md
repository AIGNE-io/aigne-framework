# AIGNE 监视器

[English](index.md) | **中文**

AIGNE 监视器是一个基于 OpenTelemetry 构建的强大可视化工具，专为监控和分析 AI Agent 数据流而设计。通过 AIGNE 监视器，您可以：

* **📊 实时监控** - 可视化追踪数据和调用链，实时了解 Agent 运行状态
* **🔍 精确定位** - 准确识别 AIGNE 内部工作流程，快速定位问题
* **🌐 灵活部署** - 支持本地 CLI 和 Blocklet 两种部署方式
* **📈 全面观测** - 收集 Trace 和 Log 数据，提供完整的可观测性
* **🔧 无缝集成** - 可作为独立服务使用，也可集成到 AIGNE 运行时

AIGNE 监视器让 AI Agent 的运行状态变得透明可见，无论您是在开发调试还是生产监控，都能获得深入的洞察和分析能力。

## 安装 AIGNE 监视器

AIGNE 监视器包含在 `@aigne/cli` 包中，也可以作为独立的 Blocklet 使用。

### 通过 CLI 安装

```bash
npm install -g @aigne/cli
```

安装完成后，您可以通过以下命令启动监视器：

```bash
aigne observe --port 7890 # 默认端口可省略
```

该命令会启动监视器服务，通过浏览器访问 `http://localhost:7890` 即可查看监视器界面。

![AIGNE Monitor Screenshot](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

### 通过 Blocklet 安装

您也可以直接安装 [AIGNE Observability Blocklet](https://store.blocklet.dev/blocklets/z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh)，在 Blocklet 环境中使用监视器功能。

所有使用 AIGNE Framework 的 Blocklet 都会自动集成监视器功能，无需额外配置即可享受完整的可观测性支持。
