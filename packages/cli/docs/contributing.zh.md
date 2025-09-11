---
labels: ["Reference"]
---

# 参与贡献

我们非常高兴您有兴趣为 `@aigne/cli` 做出贡献！您的帮助对于改善 AIGNE 的开发体验至关重要。无论是修复错误、提出新功能还是改进文档，我们都欢迎您的贡献。

本指南将指导您如何设置开发环境、运行测试以及提交您的更改。

## 快速入门

`@aigne/cli` 包是 `aigne-framework` monorepo 的一部分。要开始使用，您需要克隆主代码库并安装其依赖项。

### 1. 克隆代码库

首先，将 `aigne-framework` 代码库从 GitHub 克隆到您的本地计算机：

```bash Git Clone icon=logos:git-icon
git clone https://github.com/AIGNE-io/aigne-framework.git
cd aigne-framework
```

### 2. 安装依赖

我们使用 `bun` 作为项目的主要包管理器。请在 monorepo 的根目录下安装所有必需的依赖项：

```bash Bun Install icon=logos:bun
bun install
```

该命令将为 monorepo 中的所有包（包括 `@aigne/cli`）安装全部依赖项。

## 开发流程

所有针对 CLI 的开发命令都应在其包目录 `packages/cli` 中运行。

### 构建代码

要将 TypeScript 源代码编译成 JavaScript，请运行构建命令。该命令会使用 `tsconfig.build.json` 配置，并将编译后的文件输出到 `dist/` 目录。

```bash Build Command icon=lucide:hammer
bun run build
```

### 代码检查与类型检查

我们使用 TypeScript 编译器进行静态分析以确保代码质量。要检查是否存在类型错误而不生成 JavaScript 文件，请运行 lint 命令：

```bash Lint Command icon=lucide:check-circle
bun run lint
```

### 运行测试

我们提供了一套全面的测试套件，以确保 CLI 功能正常。可使用以下脚本进行测试：

| Command | Description |
|---|---|
| `bun run test` | 执行完整的测试套件，包括 CLI 源代码测试 (`test:src`) 和项目模板测试 (`test:templates`)。 |
| `bun run test:src` | 仅运行 CLI 核心功能的单元测试和集成测试。 |
| `bun run test:templates` | 专门针对由 `aigne create` 构建的项目模板运行测试。 |
| `bun run test:coverage` | 运行完整的测试套件并生成代码覆盖率报告。 |

在提交拉取请求前，请务必确保所有测试均已通过。

### 代码风格

我们使用 [Prettier](https://prettier.io/) 在整个项目中保持一致的代码风格。请在提交更改前确保您的代码已经过格式化。大多数编辑器都可以配置为在保存时自动格式化文件。

## 提交拉取请求

当您完成更改并通过构建和测试脚本进行验证后，就可以提交拉取请求了。

1.  在 GitHub 上 **Fork 代码库**。
2.  为您的新功能或错误修复**创建一个新分支**：`git checkout -b your-feature-name`。
3.  **提交您的更改**，并附上清晰、描述性的提交信息。
4.  将您的分支**推送到您的 Fork**：`git push origin your-feature-name`。
5.  从您的 Fork 向 `AIGNE-io/aigne-framework` 代码库的 `main` 分支**发起一个拉取请求**。
6.  在拉取请求中**提供您所做更改的详细描述**，并引用问题跟踪器中的任何相关问题。

我们会尽快审核您的贡献。感谢您帮助我们改进 AIGNE！