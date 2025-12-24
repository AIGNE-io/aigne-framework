# hub - Hub 管理

> **前置条件**:
> - [命令参考](../commands.md) - 了解所有可用命令

## 概述

`hub` 命令用于管理与 AIGNE Hub 的连接。AIGNE Hub 是一个云服务，提供 agent 托管、版本管理、团队协作和模型服务等功能。

## 语法

```bash
aigne hub <command> [options]
```

## 子命令

### connect

连接到 AIGNE Hub。

```bash
aigne hub connect [url]
```

#### 参数

- `url` (可选): AIGNE Hub 的 URL

如果不提供 URL，会显示交互式选择界面。

### list (ls)

列出所有已连接的 AIGNE Hubs。

```bash
aigne hub list
# 或简写
aigne hub ls
```

### use

切换到不同的 AIGNE Hub。

```bash
aigne hub use
```

交互式选择要使用的 Hub。

### status (st)

显示已连接 Hub 的详细信息。

```bash
aigne hub status
# 或简写
aigne hub st
```

### remove (rm)

移除已连接的 Hub。

```bash
aigne hub remove
# 或简写
aigne hub rm
```

## 使用示例

### 连接到 Hub

#### 交互式连接

```bash
$ aigne hub connect

? Choose a hub to connect:
❯ Official Hub (https://hub.aigne.io)
  Custom Hub URL
```

#### 连接到官方 Hub

选择 "Official Hub" 后，会打开浏览器进行认证。

#### 连接到自定义 Hub

```bash
$ aigne hub connect

? Choose a hub to connect: Custom Hub URL
? Enter the URL of your AIGNE Hub: https://my-hub.example.com

✓ Hub https://my-hub.example.com connected successfully.
```

#### 直接指定 URL

```bash
aigne hub connect https://my-hub.example.com
```

### 列出所有 Hubs

```bash
$ aigne hub list

Connected AIGNE Hubs:

┌────────────────────────────────────┬────────┐
│ URL                                │ ACTIVE │
├────────────────────────────────────┼────────┤
│ https://hub.aigne.io               │ YES    │
│ https://custom-hub.example.com     │ NO     │
└────────────────────────────────────┴────────┘

Use 'aigne hub use' to switch to a different hub.
```

### 切换 Hub

```bash
$ aigne hub use

? Choose a hub to switch to:
  https://hub.aigne.io
❯ https://custom-hub.example.com

✓ Switched active hub to https://custom-hub.example.com
```

### 查看 Hub 状态

```bash
$ aigne hub status

? Choose a hub to view info:
❯ https://hub.aigne.io (connected)
  https://custom-hub.example.com

AIGNE Hub Connection
──────────────────────────────────────────────
Hub:       https://hub.aigne.io
Status:    Connected ✅

User:
  Name:    John Doe
  DID:     did:abt:z1...
  Email:   john@example.com

Credits:
  Total:      100,000
  Used:       25,000
  Available:  75,000

Links:
  Payment:    https://hub.aigne.io/payment
  Credits:    https://hub.aigne.io/profile
```

### 移除 Hub

```bash
$ aigne hub remove

? Choose a hub to remove:
  https://hub.aigne.io
❯ https://custom-hub.example.com

✓ Hub https://custom-hub.example.com removed
```

## AIGNE Hub 功能

### 1. Agent 托管

- 上传和管理 agents
- 版本控制
- 公开或私有访问

### 2. 模型服务

- 访问各种 AI 模型
- 统一计费
- 无需管理多个 API 密钥

### 3. 团队协作

- 共享 agents
- 权限管理
- 协作开发

### 4. Credits 系统

- 预付费模式
- 统一计费
- 成本控制

## 凭证管理

### 存储位置

Hub 凭证安全存储在系统密钥链中：

- **macOS**: Keychain
- **Windows**: Credential Manager
- **Linux**: Secret Service API

### 凭证内容

存储的信息包括：
- `AIGNE_HUB_API_URL`: Hub 的 API 地址
- `AIGNE_HUB_API_KEY`: 认证密钥

### 安全性

- 凭证加密存储
- 不会明文保存
- 通过系统安全机制保护

## 使用 Hub 运行 Agent

连接到 Hub 后，可以直接运行 Hub 上的 agents：

```bash
# 从 Hub 运行 agent
aigne run --url https://hub.aigne.io/agents/example

# 使用 Hub 的模型服务
aigne run --aigne-hub-url https://hub.aigne.io
```

## 环境变量

可以通过环境变量配置 Hub：

```bash
export AIGNE_HUB_API_URL=https://hub.aigne.io/ai-kit
export AIGNE_HUB_API_KEY=your-api-key

aigne run
```

详见 [配置文档](../configuration.md)。

## 多 Hub 管理

### 使用场景

- **开发环境**: 使用测试 Hub
- **生产环境**: 使用生产 Hub
- **团队协作**: 每个团队使用独立 Hub

### 切换流程

```bash
# 连接多个 Hubs
aigne hub connect https://dev-hub.example.com
aigne hub connect https://prod-hub.example.com

# 查看所有 Hubs
aigne hub list

# 切换到开发 Hub
aigne hub use  # 选择 dev-hub.example.com

# 运行开发 agent
aigne run myAgent

# 切换到生产 Hub
aigne hub use  # 选择 prod-hub.example.com

# 运行生产 agent
aigne run myAgent
```

## 常见问题

### 认证失败

```
✗ Failed to connect: Authentication failed
```

解决方法：
1. 检查 Hub URL 是否正确
2. 确认网络连接
3. 验证浏览器认证是否成功
4. 联系 Hub 管理员

### Hub 未找到

```
✗ Hub not found
```

解决方法：
1. 使用 `aigne hub list` 查看已连接的 Hubs
2. 确认 Hub URL 拼写正确
3. 重新连接 Hub

### 无法切换 Hub

```
✗ Failed to set default hub
```

解决方法：
1. 确认 Hub 已连接
2. 检查凭证是否有效
3. 尝试重新连接

### Credits 不足

在 Hub 状态中显示 Credits 不足时：
1. 访问 Payment 链接充值
2. 联系管理员
3. 检查使用情况

## 官方 Hub 服务

### 地址

```
https://hub.aigne.io
```

### 功能

- ✅ 免费注册
- ✅ 多种 AI 模型
- ✅ Credits 系统
- ✅ Agent 托管
- ✅ 团队协作

### 注册

访问 https://hub.aigne.io 注册账号。

## 自托管 Hub

企业可以部署私有 Hub：

### 要求

- AIGNE Hub 服务器软件
- 数据库（PostgreSQL）
- 对象存储（S3 兼容）

### 部署

参考 AIGNE Hub 部署文档（单独提供）。

### 连接自托管 Hub

```bash
aigne hub connect https://your-private-hub.company.com
```

## 技术细节

### 源码位置

实现文件：`src/commands/hub.ts:153`

关键函数：
- `createHubCommand()` - 创建命令
- `connectToAIGNEHub()` - 连接到 Hub
- `getSecretStore()` - 获取凭证存储

### 认证流程

1. 用户选择或输入 Hub URL
2. 打开浏览器进行 OAuth 认证
3. 获取 API 密钥
4. 存储凭证到系统密钥链
5. 设置为默认 Hub

### 数据格式

存储的 Hub 信息：

```typescript
interface HubCredential {
  AIGNE_HUB_API_URL: string;
  AIGNE_HUB_API_KEY: string;
}
```

## 下一步

连接到 Hub 后，可以：

1. [run](./run.md) - 运行 Hub 上的 agents
2. [deploy](./deploy.md) - 部署 agents 到 Hub
3. [test](./test.md) - 使用 Hub 的模型服务测试

## 相关命令

- [run](./run.md) - 从 Hub 运行 agent
- [deploy](./deploy.md) - 部署到 Hub
- [test](./test.md) - 使用 Hub 服务测试

## 参考

- [命令参考](../commands.md) - 返回命令列表
- [基本工作流程](../workflow.md#团队协作) - Hub 在团队协作中的作用
- [配置](../configuration.md) - Hub 相关配置
- [AIGNE Hub 官网](https://hub.aigne.io) - 官方 Hub 服务
