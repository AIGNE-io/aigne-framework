# app - 应用管理

> **前置条件**: [命令参考](../commands.md) - 了解所有可用命令

## 概述

`app` 命令是 AIGNE CLI 的应用管理命令集合，用于管理和运行内置的 AIGNE 应用。这些应用由 agents 驱动，提供特定领域的功能。

## 内置应用

### doc-smith

文档生成和维护工具，由 agents 驱动。

```bash
aigne doc-smith
# 别名
aigne docsmith
aigne doc
```

**功能：**
- 从项目代码生成文档
- 维护项目文档
- 文档结构规划
- 自动更新文档

**使用场景：**
- 生成 API 文档
- 创建用户指南
- 维护技术文档
- 文档版本管理

### web-smith

网站页面生成和维护工具，由 agents 驱动。

```bash
aigne web-smith
# 别名
aigne websmith
aigne web
```

**功能：**
- 生成项目网站页面
- 维护网站内容
- 页面结构规划
- 自动更新网站

**使用场景：**
- 创建项目主页
- 生成文档网站
- 维护营销页面
- 内容管理

## 语法

```bash
aigne <app-name> [options]
```

## 使用示例

### doc-smith 示例

#### 生成文档

```bash
cd my-project
aigne doc-smith
```

应用会：
1. 分析项目结构
2. 读取代码和注释
3. 生成文档结构
4. 创建 Markdown 文档

#### 使用别名

```bash
aigne doc
aigne docsmith
```

三个命令效果相同。

### web-smith 示例

#### 生成网站

```bash
cd my-project
aigne web-smith
```

应用会：
1. 分析项目信息
2. 规划页面结构
3. 生成 HTML/CSS
4. 创建网站资源

#### 使用别名

```bash
aigne web
aigne websmith
```

## 工作原理

### 应用架构

每个内置应用：
- 作为独立的 npm 包发布
- 基于 AIGNE Framework 构建
- 使用 agents 实现核心功能
- 提供统一的 CLI 接口

### 应用加载

运行应用时：

1. **检查安装**: 检查应用包是否已安装
2. **自动安装**: 如未安装，自动安装应用
3. **启动应用**: Fork 子进程运行应用
4. **传递参数**: 将命令行参数传递给应用

### 环境变量

应用运行时设置的环境变量：

- `AIGNE_APP_NAME`: 应用名称
- `AIGNE_APP_PACKAGE_NAME`: npm 包名称
- `AIGNE_APP_DESCRIPTION`: 应用描述
- `AIGNE_APP_USE_BETA_APPS`: 是否使用 beta 版本

## 应用安装

### 自动安装

首次运行应用时会自动安装：

```bash
$ aigne doc-smith
Installing @aigne/doc-smith...
✓ Installation complete
Running doc-smith...
```

### 手动安装

也可以手动安装应用包：

```bash
npm install -g @aigne/doc-smith
aigne doc-smith
```

### Beta 版本

使用 beta 版本的应用：

```bash
AIGNE_APP_USE_BETA_APPS=1 aigne doc-smith
```

## 应用列表

查看所有可用的内置应用：

| 应用名 | 包名 | 别名 | 描述 |
|--------|------|------|------|
| doc-smith | @aigne/doc-smith | docsmith, doc | 文档生成和维护工具 |
| web-smith | @aigne/web-smith | websmith, web | 网站页面生成和维护工具 |

更多应用即将推出...

## 应用配置

### 全局配置

应用使用的全局配置文件：`~/.aigne/config.yaml`

```yaml
apps:
  doc-smith:
    auto_update: true
    version: latest
  web-smith:
    auto_update: true
    version: latest
```

### 项目配置

在项目中可以创建应用专用配置，例如：

```yaml
# .aigne/doc-smith/config.yaml
output_dir: docs
language: zh-CN
```

## 故障排查

### 应用未找到

```
Error: App not found
```

解决方法：
1. 检查应用名称拼写
2. 确认应用在支持列表中
3. 尝试手动安装

### 安装失败

```
Error: Installation failed
```

解决方法：
1. 检查网络连接
2. 验证 npm 配置
3. 手动安装：`npm install -g @aigne/<app-name>`

### 版本冲突

```
Error: Version mismatch
```

解决方法：
1. 更新 AIGNE CLI：`npm update -g @aigne/cli`
2. 重新安装应用
3. 清除缓存：`npm cache clean --force`

## 开发自定义应用

### 应用结构

自定义 AIGNE 应用的基本结构：

```
my-aigne-app/
├── package.json
├── agents/
│   └── main.yml
└── cli.js
```

### package.json

```json
{
  "name": "@myorg/my-aigne-app",
  "version": "1.0.0",
  "description": "My custom AIGNE app",
  "main": "cli.js",
  "bin": {
    "my-app": "cli.js"
  },
  "dependencies": {
    "@aigne/core": "^1.0.0"
  }
}
```

### 注册应用

将应用注册到 AIGNE CLI（需要修改源码或通过插件机制）。

## 更新应用

### 检查更新

```bash
npm outdated -g @aigne/doc-smith
```

### 更新到最新版本

```bash
npm update -g @aigne/doc-smith
```

### 更新所有应用

```bash
npm update -g @aigne/doc-smith @aigne/web-smith
```

## 卸载应用

### 卸载特定应用

```bash
npm uninstall -g @aigne/doc-smith
```

### 清理数据

```bash
# 删除应用配置
rm -rf ~/.aigne/doc-smith
```

## 应用隔离

### 独立环境

每个应用在独立的进程中运行：
- 环境隔离
- 资源隔离
- 错误隔离

### 通信机制

应用与 CLI 通过：
- 环境变量
- 进程退出码
- 标准输入输出

## 最佳实践

### 1. 保持更新

定期更新应用以获取最新功能和修复：

```bash
npm update -g @aigne/doc-smith
```

### 2. 项目特定配置

为每个项目创建专用配置：

```yaml
# .aigne/doc-smith/config.yaml
project_name: My Project
output_format: markdown
```

### 3. 版本锁定

在 CI/CD 中锁定应用版本：

```bash
npm install -g @aigne/doc-smith@1.2.3
```

### 4. 自动化工作流

将应用集成到开发工作流：

```yaml
# .github/workflows/docs.yml
name: Update Docs
on: [push]
jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g @aigne/cli @aigne/doc-smith
      - run: aigne doc-smith
      - run: git commit -am "Update docs" && git push
```

## 技术细节

### 源码位置

实现文件：`src/commands/app.ts:22`

关键数据：
```typescript
const builtinApps = [
  {
    name: "doc-smith",
    packageName: "@aigne/doc-smith",
    describe: "Generate and maintain project docs",
    aliases: ["docsmith", "doc"],
  },
  // ...
];
```

### 应用加载机制

```typescript
const child = fork(
  join(dirname(fileURLToPath(import.meta.url)), "./app/cli.js"),
  argv,
  {
    stdio: "inherit",
    env: {
      AIGNE_APP_NAME: app.name,
      AIGNE_APP_PACKAGE_NAME: app.packageName,
    },
  }
);
```

## 未来规划

计划添加的应用：
- **test-smith**: 测试生成工具
- **api-smith**: API 文档生成工具
- **ui-smith**: UI 组件生成工具
- **data-smith**: 数据处理工具

## 下一步

了解具体应用的使用：

1. 查看 doc-smith 文档
2. 查看 web-smith 文档
3. 探索应用配置选项

## 相关命令

- [run](./run.md) - 运行自定义 agents
- [create](./create.md) - 创建新项目
- [hub](./hub.md) - 管理应用和 agents

## 参考

- [命令参考](../commands.md) - 返回命令列表
- [AIGNE Framework 文档](https://aigne.io/docs) - 了解 AIGNE 架构
- [doc-smith 文档](https://aigne.io/docs/doc-smith) - doc-smith 详细文档
- [web-smith 文档](https://aigne.io/docs/web-smith) - web-smith 详细文档
