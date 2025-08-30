---
labels: ["Reference"]
---

# 贡献指南

欢迎为 `@aigne/cli` 做出贡献。无论是修复漏洞、完善文档，还是添加新功能，我们都非常感谢你的帮助。本指南将为你提供设置开发环境和提交贡献的必要步骤。

`@aigne/cli` 包是 `aigne-framework` monorepo 的一部分，托管在 GitHub 上。在进行重大变更之前，建议先提交一个 issue 来讨论你的提案。

- **问题跟踪**：[https://github.com/AIGNE-io/aigne-framework/issues](https://github.com/AIGNE-io/aigne-framework/issues)
- **源代码**：[https://github.com/AIGNE-io/aigne-framework](https://github.com/AIGNE-io/aigne-framework)

## 开发环境设置

开始前，你需要 fork 仓库，将其克隆到本地计算机，并安装依赖项。

1.  **Fork 和克隆仓库**

    首先，在 GitHub 上 fork `AIGNE-io/aigne-framework` 仓库。然后，将你 fork 的仓库克隆到本地计算机：

    ```bash
    git clone https://github.com/YOUR_USERNAME/aigne-framework.git
    cd aigne-framework
    ```

2.  **安装依赖**

    该项目采用 monorepo 结构。请从仓库的根目录安装所有依赖项。

    ```bash
    npm install
    ```

3.  **导航到 CLI 包**

    所有针对 `@aigne/cli` 的工作都将在其特定的包目录中进行。

    ```bash
    # 假设该包位于 'packages' 目录中
    cd packages/cli 
    ```

## 构建和测试

该项目包含多个用于辅助开发的脚本，包括构建、代码检查和测试。

### 构建代码

源代码使用 TypeScript 编写，需要编译成 JavaScript。编译后的文件会输出到 `dist/` 目录中。

要构建项目，请在 `@aigne/cli` 包目录下运行以下命令：

```bash
npm run build
```

### 代码检查

我们使用 TypeScript 编译器（`tsc`）进行静态分析和类型错误检查。要运行代码检查程序：

```bash
npm run lint
```

### 运行测试

该项目使用 `bun` 运行源文件测试，使用 `node` 的原生测试运行器运行模板测试。你可以一次性运行所有测试，也可以指定运行特定的测试套件。

要运行完整的测试套件：

```bash
npm run test
```

仅运行源代码测试：

```bash
npm run test:src
```

仅运行项目模板测试：

```bash
npm run test:templates
```

## 提交变更

当你准备好提交变更后，请按照以下步骤提交 pull request。

1.  **创建新分支**

    为你的新功能或 bug 修复创建一个具有描述性的分支。

    ```bash
    git checkout -b feature/my-new-feature
    ```

2.  **提交你的变更**

    完成修改后，使用清晰、简洁的消息提交你的变更。

3.  **推送并创建 Pull Request**

    将你的分支推送到你 fork 的仓库，并针对官方 `AIGNE-io/aigne-framework` 仓库的 `main` 分支创建一个 pull request。请在 pull request 中详细描述你所做的变更。