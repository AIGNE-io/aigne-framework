---
labels: ["Reference"]
---

# 贡献

我们欢迎您为 `@aigne/cli` 做出贡献！您的帮助对保持其良好状态至关重要。本指南提供了开始开发所需的一切，从设置环境到提交您的第一个拉取请求。

本项目托管于 GitHub 上的 [AIGNE-io/aigne-framework](https://github.com/AIGNE-io/aigne-framework)。如果您发现错误或有功能请求，请在我们的[问题跟踪器](https://github.com/AIGNE-io/aigne-framework/issues)上提出一个 issue。

## 贡献工作流

下图展示了为本项目做出贡献的典型工作流程。

```d2
direction: down

GitHub-Repo: {
  label: "AIGNE-io/aigne-framework"
  shape: package
}

Your-Fork: {
  label: "<YOUR_USERNAME>/aigne-framework"
  shape: package
}

Local-Machine: {
  label: "Local Machine"
  shape: rectangle

  New-Branch: {
    label: "Feature Branch"
    shape: rectangle
  }

  Develop: {
    label: "Code & Commit"
    shape: rectangle
  }

  Checks: {
    label: "Run Tests & Lint"
    shape: rectangle
  }
}

Pull-Request: {
  label: "Pull Request"
  shape: rectangle
}

Review-Merge: {
  label: "Code Review & Merge"
  shape: rectangle
}

GitHub-Repo -> Your-Fork: "1. Fork"
Your-Fork -> Local-Machine: "2. Clone"
Local-Machine -> Local-Machine.New-Branch: "3. Create branch"
Local-Machine.New-Branch -> Local-Machine.Develop: "4. Make changes"
Local-Machine.Develop -> Local-Machine.Checks: "5. Validate changes"
Local-Machine.Checks -> Your-Fork: "6. Push changes"
Your-Fork -> Pull-Request: "7. Create PR"
Pull-Request -> GitHub-Repo: "Submit to main branch"
GitHub-Repo -> Review-Merge: "8. Review & Merge"

```

## 开发设置

要开始开发，请先在 GitHub 上复刻该仓库，然后将其克隆到您的本地计算机：

```bash
git clone https://github.com/<YOUR_USERNAME>/aigne-framework.git
cd aigne-framework/packages/cli
```

本项目使用 Bun 进行包管理。要安装依赖项，请运行：

```bash
bun install
```

## 开发脚本

`package.json` 文件包含多个用于辅助开发的脚本。在提交代码前，请务必运行这些检查，以确保代码符合项目标准。

| Script | Description |
|---|---|
| `bun run build` | 将 `src/` 中的 TypeScript 源码编译成 `dist/` 中的 JavaScript。 |
| `bun run test` | 运行源码和模板的完整测试套件。 |
| `bun run lint` | 使用 TypeScript 编译器（`tsc`）检查类型错误。 |
| `bun run clean` | 移除 `dist` 和 `coverage` 目录。 |

在提交您的更改之前，请确保所有测试和代码检查都已通过。

## 提交拉取请求

更改准备就绪后，请按照以下步骤提交拉取请求：

1.  **为您的新功能或错误修复创建一个新分支**：
    ```bash
    git checkout -b my-new-feature
    ```
2.  **进行更改**，并使用描述性的消息提交更改。
3.  **将您的分支推送**到您复刻的仓库：
    ```bash
    git push origin my-new-feature
    ```
4.  **针对 `AIGNE-io/aigne-framework` 仓库的 `main` 分支发起拉取请求**。请为您所做的更改提供清晰的标题和描述。