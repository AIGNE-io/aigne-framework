---
labels: ["Reference"]
---

---
labels: ["Reference"]
---

# 贡献指南

我们很高兴您有兴趣为 `@aigne/cli` 做出贡献！您的帮助对于改善所有人的 AIGNE 开发体验至关重要。无论是修复错误、提出新功能还是改进文档，我们都欢迎您的贡献。

本指南将指导您如何设置开发环境、运行测试以及提交您的更改。

## 入门

`@aigne/cli` 包是 `aigne-framework` monorepo 的一部分。要开始使用，您需要克隆主仓库并安装其依赖项。

### 1. 克隆仓库

首先，将 GitHub 上的 `aigne-framework` 仓库克隆到您的本地计算机：

```bash Git Clone icon=logos:git-icon
git clone https://github.com/AIGNE-io/aigne-framework.git
cd aigne-framework
```

### 2. 安装依赖

我们使用 `bun` 作为项目的主要包管理器。请在 monorepo 的根目录下安装所有必要的依赖项：

```bash Bun Install icon=logos:bun
bun install
```

这将为 monorepo 中的所有包（包括 `@aigne/cli`）安装依赖项。

## 开发工作流

所有针对 CLI 的开发命令都应在其包目录 `packages/cli` 中运行。

### 构建代码

要将 `src/` 目录下的 TypeScript 源代码编译为 `dist/` 目录下的 JavaScript，请运行构建命令。该过程由 `tsconfig.build.json` 文件配置。

```bash Build Command icon=lucide:hammer
bun run build
```

### 代码检查与类型检查

我们使用 TypeScript 编译器进行静态分析以确保代码质量。要检查类型错误而不生成 JavaScript 文件，请运行 lint 命令：

```bash Lint Command icon=lucide:check-circle
bun run lint
```

### 运行测试

我们提供了一套全面的测试套件，以确保 CLI 功能正常。可使用以下脚本进行测试：

| 命令 | 描述 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `bun run test` | 执行完整的测试套件，包括 CLI 源代码测试（`test:src`）和项目模板测试（`test:templates`）。 |
| `bun run test:src` | 仅运行 CLI 核心功能的单元测试和集成测试。 |
| `bun run test:templates` | 专门针对由 `aigne create` 搭建的项目模板运行测试。 |
| `bun run test:coverage` | 运行整个测试套件并生成代码覆盖率报告。 |

在提交拉取请求（Pull Request）之前，请务必确保所有测试都能通过。

### 代码风格

我们使用 [Prettier](https://prettier.io/) 来维护整个项目一致的代码风格。请在提交更改前确保代码已格式化。大多数编辑器都可以配置为在保存时自动格式化文件。

## 提交拉取请求

在完成更改并通过构建和测试脚本进行验证后，您就可以提交拉取请求（Pull Request）了。

1. 在 GitHub 上 **Fork 仓库**。
2. 为您的新功能或错误修复**创建一个新分支**：`git checkout -b your-feature-name`。
3. **提交您的更改**，并附上清晰且描述性的提交信息。
4. **将您的分支推送**到您的 fork：`git push origin your-feature-name`。
5. 从您的 fork 向 `AIGNE-io/aigne-framework` 仓库的 `main` 分支**发起一个拉取请求**。
6. 在拉取请求中**提供您更改的详细描述**，并引用[问题跟踪器](https://github.com/AIGNE-io/aigne-framework/issues)中的任何相关问题。

我们会尽快审查您的贡献。感谢您帮助我们改进 AIGNE！