---
labels: ["Reference"]
---

# 贡献

我们欢迎您为 `@aigne/cli` 做出贡献！您的帮助对于保持其卓越至关重要。本指南提供了开始开发所需的一切，从设置环境到提交您的第一个拉取请求。

该项目托管在 GitHub 的 [AIGNE-io/aigne-framework](https://github.com/AIGNE-io/aigne-framework) 上。如果您发现错误或有功能请求，请在我们的 [问题跟踪器](https://github.com/AIGNE-io/aigne-framework/issues) 上提交 issue。

## 开发设置

首先，在 GitHub 上 fork 该仓库，然后将其克隆到本地计算机：

```bash
git clone https://github.com/<YOUR_USERNAME>/aigne-framework.git
cd aigne-framework/packages/cli
```

本项目使用 Bun 进行包管理。要安装依赖项，请运行：

```bash
bun install
```

## 开发工作流

`package.json` 文件包含多个用于辅助开发的脚本。在提交代码前，请务必运行这些检查，以确保代码符合项目标准。

### 构建代码

要将 `src/` 目录下的 TypeScript 源代码编译为 `dist/` 目录下的 JavaScript，请运行：

```bash
bun run build
```

### 运行测试

该项目有一个全面的测试套件。要运行所有测试（包括核心源代码和项目模板的测试），请使用：

```bash
bun run test
```

### 代码检查

我们使用 TypeScript 编译器（`tsc`）检查类型错误并确保代码质量。要运行代码检查工具，请使用以下命令：

```bash
bun run lint
```

在提交更改前，请确保所有测试和代码检查均通过。

## 提交拉取请求

更改准备就绪后，请按照以下步骤提交拉取请求：

1.  **新建一个分支** 用于您的功能开发或错误修复：
    ```bash
    git checkout -b my-new-feature
    ```
2.  **进行更改** 并使用描述性信息提交。
3.  **将您的分支** 推送到您 fork 的仓库：
    ```bash
    git push origin my-new-feature
    ```
4.  **针对 `AIGNE-io/aigne-framework` 仓库的 `main` 分支发起一个拉取请求**。请为您的更改提供清晰的标题和描述。