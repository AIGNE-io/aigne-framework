# deploy - 部署应用

> **前置条件**:
> - [命令参考](../commands.md) - 了解所有可用命令
> - [test](./test.md) - 确保应用已测试

## 概述

`deploy` 命令用于将 AIGNE 应用部署到指定的 endpoint。当前实现基于 Blocklet 平台，将应用打包并部署到 Blocklet 服务器。

## 语法

```bash
aigne deploy --path <path> --endpoint <endpoint>
```

## 选项

### --path

- **类型**: 字符串（必需）
- **描述**: AIGNE 应用的路径

必须包含 `aigne.yaml` 配置文件。

### --endpoint

- **类型**: 字符串（必需）
- **描述**: 部署目标的 endpoint 地址

格式：`http://username:access-key@hostname`

示例：
```
http://admin:my-access-key@192.168.1.100
https://user:key@my-server.com
```

## 使用示例

### 基本用法

#### 部署当前项目

```bash
aigne deploy --path . --endpoint http://admin:key@192.168.1.100
```

#### 部署指定路径的项目

```bash
aigne deploy \
  --path /path/to/my-agent \
  --endpoint https://admin:access-key@my-server.example.com
```

### 完整工作流

```bash
# 1. 测试应用
aigne test

# 2. 部署应用
aigne deploy --path . --endpoint http://admin:key@server.com

# 3. 验证部署
curl http://server.com/my-agent
```

## 部署流程

### 1. 准备部署环境

- 检查 `aigne.yaml` 文件
- 创建 `.deploy` 临时目录
- 复制模板文件

### 2. 检查 Blocklet CLI

- 验证 Blocklet CLI 是否已安装
- 如未安装，提示安装

### 3. 配置 Blocklet

- 生成 Blocklet DID
- 配置 `blocklet.yml`
- 设置应用名称和元数据

### 4. 打包应用

- 运行 `blocklet bundle`
- 创建发布包

### 5. 部署到服务器

- 上传应用包
- 安装到目标服务器
- 启动应用

### 6. 清理

- 删除临时文件
- 显示部署结果

## 部署输出

### 成功示例

```bash
$ aigne deploy --path . --endpoint http://admin:key@192.168.1.100

✔ Prepare deploy environment
  Preparing deploy environment...
  Copying template files...
  Running npm install...

✔ Check Blocklet CLI
  Checking Blocklet CLI Version...

✔ Configure Blocklet
  Configuring Blocklet...
  Blocklet name: my-aigne-agent, DID: z2E5...

✔ Bundle Blocklet
  Running blocklet bundle...

Deploying to http://192.168.1.100...

✅ Deploy completed: . -> http://192.168.1.100
```

### 失败示例

```bash
$ aigne deploy --path . --endpoint http://admin:wrong-key@192.168.1.100

✔ Prepare deploy environment
✔ Check Blocklet CLI
✔ Configure Blocklet
✔ Bundle Blocklet

❌ Deploy failed: Authentication failed
```

## Blocklet 平台

### 什么是 Blocklet

Blocklet 是一个去中心化应用平台，提供：
- 应用托管
- 自动化部署
- DID（去中心化标识符）
- 应用市场

### 安装 Blocklet CLI

如果未安装 Blocklet CLI，部署时会提示安装：

```bash
? Install Blocklet CLI? yes
Installing Blocklet CLI...
```

手动安装：

```bash
npm install -g @blocklet/cli
```

### Blocklet Server

需要有一个运行中的 Blocklet Server：

#### 本地安装

```bash
npm install -g @blocklet/cli
blocklet server init
blocklet server start
```

#### 云服务

使用 Blocklet 云服务或自托管服务器。

## 配置文件

### aigne.yaml

必须存在的配置文件：

```yaml
name: my-agent
description: My AIGNE Agent
version: 1.0.0
agents:
  - name: myAgent
    model: openai:gpt-4
```

### blocklet.yml

自动生成的 Blocklet 配置（在 `.deploy` 目录）：

```yaml
name: my-aigne-agent
title: my-aigne-agent
did: z2E5Ry7CpAoH...
version: 1.0.0
main: agent/aigne.yaml
```

### package.json

如果项目有 `package.json`，会自动包含在部署包中。

## DID 管理

### 什么是 DID

DID（Decentralized Identifier，去中心化标识符）是应用的唯一标识。

### DID 存储

首次部署时创建的 DID 会存储在：

```
~/.aigne/deployed.yaml
```

格式：

```yaml
/path/to/project:
  name: my-aigne-agent
  did: z2E5Ry7CpAoH...
```

### 重复部署

相同路径的项目会使用相同的 DID，实现版本更新而非创建新应用。

## 部署目标

### Endpoint 格式

```
<protocol>://<username>:<access-key>@<hostname>[:<port>]
```

组成部分：
- `protocol`: `http` 或 `https`
- `username`: Blocklet Server 用户名
- `access-key`: 访问密钥
- `hostname`: 服务器地址
- `port`: 端口（可选，默认 80/443）

### 获取访问密钥

在 Blocklet Server 管理界面：

1. 登录 Blocklet Server
2. 进入 Settings > Developer
3. 创建或查看 Access Key

## 部署环境

### 文件结构

部署时创建的 `.deploy` 目录：

```
.deploy/
├── agent/              # 复制的 agent 文件
├── blocklet.yml        # Blocklet 配置
├── package.json        # 依赖配置（如有）
└── .blocklet/
    └── bundle/         # 打包的发布文件
```

### 排除文件

以下文件/目录不会包含在部署包中：
- `.deploy/`
- `node_modules/`

## 常见问题

### path 参数必需

```
Error: path is required
```

解决方法：
```bash
aigne deploy --path . --endpoint http://...
```

### endpoint 参数必需

```
Error: endpoint is required
```

解决方法：
```bash
aigne deploy --path . --endpoint http://admin:key@server.com
```

### 入口文件未找到

```
Error: Entry file not found: aigne.yaml
```

解决方法：
1. 确认在正确的目录
2. 检查 `aigne.yaml` 文件存在
3. 验证文件名拼写

### Blocklet CLI 未安装

```
Error: Blocklet CLI not found
```

解决方法：
1. 允许自动安装
2. 手动安装：`npm install -g @blocklet/cli`

### 认证失败

```
Error: Authentication failed
```

解决方法：
1. 检查 access key 是否正确
2. 验证用户名
3. 确认服务器地址

### DID 创建失败

```
Error: DID not found
```

解决方法：
1. 确认 Blocklet CLI 版本
2. 检查网络连接
3. 查看详细日志

## 生产部署最佳实践

### 1. 使用 CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @aigne/cli
      - run: |
          aigne deploy \
            --path . \
            --endpoint ${{ secrets.DEPLOY_ENDPOINT }}
```

### 2. 环境分离

```bash
# 开发环境
aigne deploy --path . --endpoint $DEV_ENDPOINT

# 测试环境
aigne deploy --path . --endpoint $STAGING_ENDPOINT

# 生产环境
aigne deploy --path . --endpoint $PROD_ENDPOINT
```

### 3. 版本管理

更新 `aigne.yaml` 中的版本号：

```yaml
name: my-agent
version: 1.0.1  # 递增版本号
```

### 4. 部署前检查

```bash
# 运行测试
aigne test

# 运行评估
aigne eval myAgent --dataset data.csv

# 确认无误后部署
aigne deploy --path . --endpoint $ENDPOINT
```

## 监控和维护

### 部署后验证

```bash
# 检查应用状态
curl http://server.com/my-agent/health

# 查看日志
blocklet logs my-aigne-agent
```

### 更新应用

重新运行 deploy 命令会更新现有应用：

```bash
# 修改代码后
aigne deploy --path . --endpoint $ENDPOINT
```

### 回滚

如需回滚到之前的版本：

```bash
blocklet rollback my-aigne-agent
```

## 技术细节

### 源码位置

实现文件：`src/commands/deploy.ts:67`

关键函数：
- `createDeployCommands()` - 创建命令
- `deploy()` - 执行部署
- `copyDir()` - 复制目录

### 部署文件

存储在：`~/.aigne/deployed.yaml`

格式：

```yaml
/absolute/path/to/project:
  name: blocklet-name
  did: z2E5...
```

## 替代部署方式

### Docker 部署

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install -g @aigne/cli
CMD ["aigne", "run"]
```

### 手动部署

```bash
# 打包
tar -czf my-agent.tar.gz .

# 上传
scp my-agent.tar.gz user@server:/path/

# 解压并运行
ssh user@server "cd /path && tar -xzf my-agent.tar.gz && aigne run"
```

## 下一步

部署完成后，可以：

1. [observe](./observe.md) - 监控生产环境
2. [hub](./hub.md) - 使用 Hub 管理部署
3. [serve-mcp](./serve-mcp.md) - 作为 MCP 服务运行

## 相关命令

- [test](./test.md) - 部署前测试
- [eval](./eval.md) - 部署前评估
- [hub](./hub.md) - Hub 部署管理

## 参考

- [命令参考](../commands.md) - 返回命令列表
- [基本工作流程](../workflow.md#7-部署上线) - 部署在开发流程中的位置
- [Blocklet 文档](https://www.blocklet.io/docs) - Blocklet 平台文档
