# deploy - 部署应用

`aigne deploy` 命令用于将 AIGNE 应用部署到指定端点，支持 Blocklet 部署方式。

## 命令格式

```bash
aigne deploy --path <path> --endpoint <endpoint>
```

## 参数说明

### 必需选项

- **`--path <path>`**：AIGNE 应用的路径
  - 指向包含 `aigne.yaml` 的目录
  
- **`--endpoint <endpoint>`**：部署目标端点 URL
  - Blocklet Server 的地址
  - 示例：`https://my-server.com`

## 使用示例

### 基本部署

部署到指定的 Blocklet Server：

```bash
aigne deploy --path ./my-agent --endpoint https://server.example.com
```

### 使用当前目录

如果在项目目录中，可以使用相对路径：

```bash
cd my-agent
aigne deploy --path . --endpoint https://server.example.com
```

## 部署流程

<!-- afs:image id="img-008" key="deploy-command-flow" desc="Deployment workflow diagram: prepare environment → install Blocklet CLI → configure Blocklet → bundle application → deploy to server" -->

`aigne deploy` 命令执行以下步骤：

### 1. 准备部署环境

- 创建临时部署目录（`.deploy`）
- 复制模板文件
- 复制 Agent 文件到部署目录

### 2. 检查 Blocklet CLI

- 检查是否安装了 Blocklet CLI
- 如果未安装，提示用户安装
- 验证 Blocklet CLI 版本

### 3. 配置 Blocklet

- 生成或更新 `blocklet.yml` 配置
- 设置 Blocklet 名称和 DID
- 配置应用元数据

### 4. 打包应用

- 运行 `blocklet bundle` 打包应用
- 创建部署包（`.blocklet/bundle`）
- 验证打包结果

### 5. 部署到服务器

- 将打包的应用上传到指定端点
- 在服务器上安装和启动应用
- 清理临时文件

## Blocklet 配置

### 自动生成配置

首次部署时，系统会：

1. **请求 Blocklet 名称**：
   ```
   ? Please input agent blocklet name: (my-agent)
   ```

2. **生成 DID**：
   自动创建唯一的 Blocklet DID

3. **保存配置**：
   将配置保存到 `~/.aigne/deployed.yaml`

### 配置存储

部署信息存储在：
```
~/.aigne/deployed.yaml
```

内容示例：
```yaml
/path/to/my-agent:
  name: my-agent
  did: z1qwertyuiopasdfghjklzxcvbnm
```

### 再次部署

已部署过的应用会：
- 重用之前的 Blocklet 名称和 DID
- 自动更新到最新版本
- 无需重新配置

## Blocklet CLI

### 安装 Blocklet CLI

如果未安装，系统会提示：

```
? Install Blocklet CLI? (Y/n)
```

选择 `Yes` 将自动安装：

```bash
npm install -g @blocklet/cli
```

### 手动安装

您也可以手动安装 Blocklet CLI：

```bash
npm install -g @blocklet/cli
```

验证安装：

```bash
blocklet --version
```

## 部署目录结构

部署过程中创建的目录结构：

```
.deploy/
├── blocklet.yml         # Blocklet 配置
├── package.json         # 项目依赖
├── agent/               # Agent 文件
│   ├── aigne.yaml
│   └── ...
└── .blocklet/
    └── bundle/          # 打包后的文件
```

## 部署输出

### 成功部署

```
✓ Prepare deploy environment
✓ Check Blocklet CLI
✓ Configure Blocklet
  Blocklet name: my-agent, DID: z1qwertyuiopasdfghjklzxcvbnm
✓ Bundle Blocklet

Deploying to https://server.example.com...
✓ Deploy completed: /path/to/my-agent -> https://server.example.com
```

### 失败处理

如果部署失败，会显示错误信息：

```
✗ Deploy failed: Connection timeout
```

查看详细错误信息以排查问题。

## 部署到不同环境

### 开发环境

```bash
aigne deploy \
  --path ./my-agent \
  --endpoint https://dev.example.com
```

### 测试环境

```bash
aigne deploy \
  --path ./my-agent \
  --endpoint https://test.example.com
```

### 生产环境

```bash
aigne deploy \
  --path ./my-agent \
  --endpoint https://prod.example.com
```

## 环境变量

部署时会复制项目的配置文件：

- `package.json`
- `.env` 文件（需要在服务器上配置）
- 其他配置文件

**注意**：`.env` 文件不会自动部署，需要在服务器上单独配置。

## 更新已部署的应用

### 代码更新

修改 Agent 代码后重新部署：

```bash
# 修改代码
# ...

# 重新部署
aigne deploy --path ./my-agent --endpoint https://server.example.com
```

系统会：
- 使用相同的 Blocklet 名称和 DID
- 更新应用代码
- 重启服务

### 配置更新

修改配置文件后重新部署：

```bash
# 修改 aigne.yaml
# ...

# 重新部署
aigne deploy --path ./my-agent --endpoint https://server.example.com
```

## CI/CD 集成

### GitHub Actions

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
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install AIGNE CLI
        run: npm install -g @aigne/cli
      
      - name: Install dependencies
        run: npm install
      
      - name: Deploy to production
        run: |
          aigne deploy \
            --path . \
            --endpoint ${{ secrets.DEPLOY_ENDPOINT }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy:
  stage: deploy
  script:
    - npm install -g @aigne/cli
    - npm install
    - aigne deploy --path . --endpoint $DEPLOY_ENDPOINT
  only:
    - main
```

## 部署配置

### blocklet.yml

部署时生成的 Blocklet 配置示例：

```yaml
name: my-agent
title: My Agent
did: z1qwertyuiopasdfghjklzxcvbnm
version: 1.0.0
description: AIGNE Agent
author: Your Name

interfaces:
  - type: web
    name: agent
    port: BLOCKLET_PORT
    path: /

environments:
  - name: OPENAI_API_KEY
    description: OpenAI API Key
    required: true
```

## 常见问题

### Blocklet CLI 未安装

**问题**：系统提示安装 Blocklet CLI

**解决方案**：
- 选择自动安装（推荐）
- 手动安装：`npm install -g @blocklet/cli`

### 部署超时

**问题**：部署过程超时

**解决方案**：
- 检查网络连接
- 确认服务器地址正确
- 检查服务器状态
- 增加超时时间（需要修改代码）

### 权限错误

**问题**：无权限部署到服务器

**解决方案**：
- 确认服务器访问权限
- 检查认证信息
- 联系服务器管理员

### 配置冲突

**问题**：Blocklet 配置冲突

**解决方案**：
- 删除 `~/.aigne/deployed.yaml` 中的旧配置
- 重新部署并使用新名称

### 打包失败

**问题**：`blocklet bundle` 失败

**解决方案**：
- 检查项目结构
- 确认 `package.json` 正确
- 查看详细错误日志
- 确保所有依赖已安装

## 最佳实践

1. **版本管理**：使用 Git 标签管理部署版本
2. **环境分离**：为不同环境使用不同的端点
3. **自动化部署**：集成到 CI/CD 流程
4. **配置管理**：使用环境变量管理敏感配置
5. **回滚计划**：保留之前的部署版本以便回滚
6. **监控部署**：部署后验证应用运行状态

## 部署检查清单

部署前检查：

- [ ] 代码已提交到版本控制
- [ ] 所有测试通过
- [ ] 配置文件正确
- [ ] API 密钥已配置
- [ ] 服务器地址正确
- [ ] 有足够的部署权限

部署后验证：

- [ ] 应用成功启动
- [ ] 功能正常工作
- [ ] 监控数据正常
- [ ] 日志无错误

## 导航

### 父主题

- [命令参考](../commands.md) - 返回命令列表

### 前置条件

- [create 命令](./create.md) - 创建要部署的项目
- [test 命令](./test.md) - 部署前进行测试

### 相关主题

- [serve-mcp 命令](./serve-mcp.md) - 本地运行服务
- [observe 命令](./observe.md) - 监控部署后的应用
- [配置说明](../configuration.md) - 配置部署环境

### 下一步

- [hub 命令](./hub.md) - 管理 AIGNE Hub 连接
- [observe 命令](./observe.md) - 监控生产环境
