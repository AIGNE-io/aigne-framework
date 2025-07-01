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
aigne observe
```

### 通过 Blocklet 安装

您也可以直接安装 [AIGNE Observability Blocklet](https://store.blocklet.dev/blocklets/z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh)，在 Blocklet 环境中使用监视器功能。

## 快速开始

### 基础操作

* [**📊 使用监视器**](observe.zh.md) - 启动和使用监视器服务
* [**🔧 运行示例**](observe.zh.md#运行示例应用) - 运行示例应用查看监控效果

### 启动监视器

使用以下命令快速启动 AIGNE 监视器：

```bash
aigne observe
```

成功启动后，在浏览器中访问 `http://localhost:7890` 即可查看监视器界面。

## 主要功能

### 实时追踪监控

* **调用链可视化** - 清晰展示 Agent 之间的调用关系和数据流转
* **性能指标** - 监控响应时间、吞吐量等关键性能指标
* **错误追踪** - 快速识别和定位运行时错误

### 数据收集与分析

* **Trace 数据** - 收集完整的请求追踪信息
* **Log 数据** - 聚合和分析应用日志
* **OpenTelemetry 兼容** - 支持标准的可观测性协议

### 灵活的部署选项

* **本地开发** - 通过 AIGNE CLI 快速启动
* **生产环境** - 作为 Blocklet 部署到生产环境
* **集成模式** - 自动集成到 AIGNE 运行时

## 使用场景

### 开发调试

在开发 AI Agent 时，使用监视器可以：

* 实时查看 Agent 的执行流程
* 快速定位代码问题和性能瓶颈
* 验证 Agent 之间的交互逻辑

### 生产监控

在生产环境中，监视器帮助您：

* 监控 Agent 的运行健康状态
* 分析用户请求的处理流程
* 及时发现和解决系统问题

### 性能优化

通过监视器数据，您可以：

* 识别性能瓶颈和优化机会
* 分析资源使用情况
* 优化 Agent 的响应速度

## Blocklet 集成

所有使用 AIGNE Framework 的 Blocklet 都会自动集成监视器功能，无需额外配置即可享受完整的可观测性支持。

### 自动集成特性

* **零配置启动** - Blocklet 环境中自动启用监视器
* **统一界面** - 与 Blocklet 管理界面无缝集成
* **数据持久化** - 自动保存和管理监控数据
* **权限控制** - 基于 Blocklet 的用户权限系统
