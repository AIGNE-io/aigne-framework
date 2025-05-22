# 版本发布流程

[English](./RELEASING.md) | [中文](./RELEASING.zh.md)

本项目使用 [Release Please Action](https://github.com/marketplace/actions/release-please-action) 来管理版本发布流程。Release Please 会通过分析提交信息、维护 CHANGELOG 并提出版本变更的拉取请求，简化发布流程。

## 提交规范

为了使 release-please 能够正确识别变更类型并自动生成变更日志，所有提交信息（commit message）必须遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/) 规范：

```
<type>(<scope>): <subject>
```

常用的 `type` 类型包括：

* `feat`: 新特性或功能
* `fix`: 修复 bug
* `docs`: 仅文档变更
* `style`: 不影响代码含义的变更（空格、格式化、缺少分号等）
* `refactor`: 既不修复 bug 也不添加新功能的代码重构
* `perf`: 提高性能的代码变更
* `test`: 添加或修正测试
* `build`: 影响构建系统或外部依赖的变更（例如 webpack, npm）
* `ci`: 对 CI 配置文件和脚本的变更
* `chore`: 其他不修改 src 或测试文件的变更
* `revert`: 恢复之前的提交

对于影响多个包的变更，可以在 scope 中指定，例如：`feat(core,types): 添加新的类型定义`

## 版本发布流程

在基于 Release Please 的版本管理流程中，版本发布遵循以下步骤：

1. 开发者将功能或修复提交到主分支（main）
2. 当合并到 main 分支后，Release Please Action 自动创建或更新"发布 PR"
3. 该 PR 包含版本更新、CHANGELOG 更新，并会在合并后自动创建相应的 GitHub Release
4. CI 将自动发布更新后的包

## 配置文件

本项目的 Release Please 配置使用以下两个文件：

* `release-please-config.json`: 定义版本管理策略、发布类型等
* `.release-please-manifest.json`: 跟踪各个包的当前版本

## 手动触发发布

通常情况下，Release Please 会在有新的符合约定式提交规范的提交后自动创建或更新发布 PR。如果需要手动触发，可以：

1. 进入 GitHub 仓库的 Actions 页面
2. 选择 "Release Please" 工作流
3. 点击 "Run workflow" 按钮，选择 "main" 分支并执行

## 更新主要版本号

如果需要发布主要版本（major version）更新，可以使用以下格式的提交信息：

```
feat!: 引入不兼容的 API 变更
```

或者

```
feat(api)!: 重大 API 设计改变
```

带有 `!` 标记的提交会触发主要版本号的更新。

## 预发布版本

对于预发布版本（如 beta、alpha 等），可以在 `release-please-config.json` 文件中设置 `prerelease` 属性为 true，并指定 `prerelease-type`：

```json
{
  "packages": {
    ".": {
      "release-type": "node",
      "prerelease": true,
      "prerelease-type": "beta"
    }
  }
}
```

## 多包仓库

对于像本项目这样的多包仓库（monorepo），Release Please 可以管理多个包的版本。配置文件中的 `packages` 部分定义了每个包的版本管理策略。
