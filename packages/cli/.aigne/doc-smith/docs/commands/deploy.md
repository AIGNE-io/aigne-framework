# deploy - 部署应用

`deploy` 命令用于将 AIGNE 应用部署到生产环境，支持部署为 Blocklet 应用。

## 语法

```bash
aigne deploy --path <path> --endpoint <endpoint>
```

## 选项

| 选项 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `--path` | string | 是 | AIGNE 应用的路径 |
| `--endpoint` | string | 是 | 部署目标端点 URL |

## 部署流程

`deploy` 命令会执行以下步骤：

1. **准备部署环境**：创建部署目录并复制文件
2. **检查 Blocklet CLI**：验证或安装 Blocklet CLI 工具
3. **配置 Blocklet**：配置应用名称和 DID
4. **打包应用**：创建 Blocklet 包
5. **部署到目标**：上传并安装到指定端点

## 使用方式

### 基本用法

```bash
aigne deploy --path ./my-agent --endpoint https://my-server.com
```

### 交互式部署

如果首次部署，CLI 会提示输入：

1. **Blocklet 名称**：应用的显示名称
2. **安装 Blocklet CLI**：如果未安装会询问是否安装

## Blocklet CLI

### 自动安装

如果系统未安装 Blocklet CLI，部署过程会询问是否安装：

```
? Install Blocklet CLI? (Use arrow keys)
❯ yes
  no
```

选择 `yes` 会自动执行：

```bash
npm install -g @blocklet/cli
```

### 手动安装

您也可以提前安装 Blocklet CLI：

```bash
npm install -g @blocklet/cli
```

验证安装：

```bash
blocklet --version
```

## 部署文件

部署过程会在项目中创建 `.deploy/` 目录：

```
my-agent/
├── .deploy/
│   ├── agent/          # 代理文件副本
│   ├── blocklet.yml    # Blocklet 配置
│   └── package.json    # 依赖定义
└── ...
```

部署完成后，`.deploy/` 目录会被自动清理。

## 配置记录

部署信息会保存在 `~/.aigne/deployed.yaml`：

```yaml
/path/to/my-agent:
  name: my-agent
  did: did:abt:z1abc...
```

这允许后续部署时自动使用相同的配置。

## 示例

### 示例 1：基本部署

```bash
# 部署到本地 Blocklet Server
aigne deploy --path ./my-agent --endpoint http://localhost:8090

# 部署到远程服务器
aigne deploy --path ./my-agent --endpoint https://server.example.com
```

### 示例 2：CI/CD 部署

```bash
# 在 CI/CD 脚本中
export DEPLOY_ENDPOINT=https://production.example.com

aigne deploy \
  --path ./dist/agent \
  --endpoint $DEPLOY_ENDPOINT
```

### 示例 3：多环境部署

```bash
# 开发环境
aigne deploy --path ./agent --endpoint https://dev.example.com

# 测试环境
aigne deploy --path ./agent --endpoint https://test.example.com

# 生产环境
aigne deploy --path ./agent --endpoint https://prod.example.com
```

## 部署要求

### 项目要求

1. **aigne.yaml**：项目根目录必须包含 `aigne.yaml` 文件
2. **依赖**：所有依赖需在 `package.json` 中声明

### 端点要求

1. **Blocklet Server**：目标端点必须运行 Blocklet Server
2. **网络访问**：确保可以访问目标端点
3. **认证**：可能需要配置 Blocklet Server 访问权限

## 故障排查

### 常见问题

#### Q: 部署失败："Entry file not found"

A: 确保项目根目录包含 `aigne.yaml` 文件：

```bash
ls -la my-agent/aigne.yaml
```

#### Q: 部署失败："Blocklet CLI not found"

A: 手动安装 Blocklet CLI：

```bash
npm install -g @blocklet/cli
```

#### Q: 部署失败："DID not found"

A: 清理部署缓存并重试：

```bash
rm -rf my-agent/.deploy
rm ~/.aigne/deployed.yaml
aigne deploy --path ./my-agent --endpoint https://server.example.com
```

#### Q: 如何更新已部署的应用？

A: 再次运行相同的部署命令，CLI 会自动更新：

```bash
aigne deploy --path ./my-agent --endpoint https://server.example.com
```

### 调试技巧

查看详细的部署日志：

```bash
# 部署过程会显示详细的进度信息
aigne deploy --path ./my-agent --endpoint https://server.example.com
```

## 部署优化

### 1. 排除不必要的文件

在项目中创建 `.blockletignore` 文件：

```
# .blockletignore
*.log
.env
.env.*
node_modules/
.git/
test/
*.test.js
```

### 2. 优化包大小

```bash
# 移除开发依赖
npm prune --production

# 部署前构建
npm run build
```

### 3. 使用环境变量

在 Blocklet Server 中配置环境变量而非硬编码：

```yaml
# blocklet.yml
environments:
  - name: OPENAI_API_KEY
    description: OpenAI API Key
    required: true
    secure: true
```

## 生产环境建议

### 1. 版本管理

在 `aigne.yaml` 中指定版本：

```yaml
name: my-agent
version: 1.0.0
```

### 2. 健康检查

添加健康检查端点：

```yaml
# blocklet.yml
interfaces:
  - type: web
    name: health
    path: /health
```

### 3. 监控和日志

部署后配置监控：

```bash
# 查看应用日志
blocklet logs my-agent

# 查看应用状态
blocklet status my-agent
```

### 4. 备份和回滚

```bash
# 备份当前版本
blocklet backup my-agent

# 回滚到上一个版本
blocklet rollback my-agent
```

## 安全建议

1. **不要提交敏感信息**：使用环境变量存储 API 密钥
2. **使用 HTTPS**：确保端点使用安全连接
3. **限制访问**：配置 Blocklet Server 访问控制
4. **定期更新**：保持依赖库最新版本

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
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @aigne/cli @blocklet/cli
      - run: |
          aigne deploy \
            --path . \
            --endpoint ${{ secrets.DEPLOY_ENDPOINT }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy:
  image: node:18
  script:
    - npm install -g @aigne/cli @blocklet/cli
    - aigne deploy --path . --endpoint $DEPLOY_ENDPOINT
  only:
    - main
```

## 下一步

- 查看 [serve-mcp 命令](/commands/serve-mcp.md) 了解如何运行 MCP 服务
- 查看 [observe 命令](/commands/observe.md) 了解如何监控部署的应用
- 阅读 [Blocklet 文档](https://www.blocklet.io/docs) 了解更多部署选项

---

**相关命令：**
- [run](/commands/run.md) - 本地运行代理
- [serve-mcp](/commands/serve-mcp.md) - MCP 服务器
- [observe](/commands/observe.md) - 监控应用
