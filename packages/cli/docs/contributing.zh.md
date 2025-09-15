---
labels: ["Reference"]
---

# 贡献指南

非常感谢你对为 `@aigne/cli` 做出贡献感兴趣！你的帮助对于改善 AIGNE 的开发体验至关重要。无论是修复错误、提出新功能还是改进文档，我们都欢迎你的贡献。

本指南提供了设置开发环境、运行测试和提交更改的说明。

## 入门

`@aigne/cli` 包是 `aigne-framework` monorepo 的一部分。首先，你需要克隆主仓库并安装其依赖项。

### 1. 克隆仓库

首先，将 GitHub 上的 `aigne-framework` 仓库克隆到你的本地计算机：

```bash Git Clone icon=logos:git-icon
git clone https://github.com/AIGNE-io/aigne-framework.git
cd aigne-framework
```

### 2. 安装依赖

我们使用 `bun` 作为项目的主要包管理器。请在 monorepo 的根目录下安装所有必要的依赖项：

```bash Bun Install icon=logos:bun
bun install
```

这将为 monorepo 中的每个包（包括 `@aigne/cli`）安装所有依赖项。

## 开发工作流

所有针对 CLI 的开发命令都应在其包目录 `packages/cli` 中运行。

### 构建代码

运行构建命令，可将 `src/` 目录下的 TypeScript 源代码编译为 `dist/` 目录下的 JavaScript。此过程由 `tsconfig.build.json` 进行配置。

```bash Build Command icon=lucide:hammer
bun run build
```

### 代码检查与类型检查

我们使用 TypeScript 编译器进行静态分析以确保代码质量。运行 lint 命令可以检查类型错误，而不会生成 JavaScript 文件：

```bash Lint Command icon=lucide:check-circle
bun run lint
```

### 运行测试

我们提供了一套全面的测试套件，以确保 CLI 功能正常。可使用以下脚本进行测试：

| 命令                 | 描述                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `bun run test`            | 执行完整的测试套件，包括 CLI 源代码 (`test:src`) 和项目模板 (`test:templates`) 的测试。   |
| `bun run test:src`        | 仅运行 CLI 核心功能的单元测试和集成测试。                                                      |
| `bun run test:templates`  | 专门运行由 `aigne create`搭建的项目模板的测试。                                                   |
| `bun run test:coverage`   | 运行整个测试套件并生成代码覆盖率报告。                                                                |

在提交拉取请求 (pull request) 之前，请务必确保所有测试都能通过。

### 代码风格

我们使用 [Prettier](https://prettier.io/) 在整个项目中保持一致的代码风格。请在提交更改前确保代码已格式化。大多数编辑器都可以配置为在保存时自动格式化文件。

## 提交拉取请求

在完成更改并通过构建和测试脚本验证后，你就可以提交拉取请求 (pull request) 了。

1.  在 GitHub 上 **Fork 本仓库**。
2.  为你的新功能或错误修复**创建一个新分支**：`git checkout -b your-feature-name`。
3.  使用清晰且描述性的提交信息**提交你的更改**。
4.  **将你的分支推送**到你的 fork：`git push origin your-feature-name`。
5.  从你的 fork 向 `AIGNE-io/aigne-framework` 仓库的 `main` 分支**发起一个拉取请求 (pull request)**。
6.  在拉取请求 (pull request) 中**提供你所做更改的详细描述**，并引用 [issue tracker](https://github.com/AIGNE-io/aigne-framework/issues) 中的任何相关问题。

我们会尽快审查你的贡献。感谢你帮助我们改进 AIGNE！