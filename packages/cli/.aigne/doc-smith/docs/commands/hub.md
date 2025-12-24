# hub - AIGNE Hub

`hub` 命令用于管理与 AIGNE Hub 的连接，包括连接、切换、查看状态和管理远程资源。

## 语法

```bash
aigne hub <command>
```

## 子命令

| 命令 | 别名 | 描述 |
|------|------|------|
| `connect [url]` | - | 连接到 AIGNE Hub |
| `list` | `ls` | 列出所有已连接的 Hub |
| `use` | - | 切换到不同的 Hub |
| `status` | `st` | 查看 Hub 详细信息 |
| `remove` | `rm` | 移除已连接的 Hub |

## 使用方式

### connect - 连接到 Hub

连接到官方或自定义 AIGNE Hub。

#### 基本用法

```bash
# 交互式选择
aigne hub connect

# 直接指定 URL
aigne hub connect https://hub.aigne.io
```

#### 交互式连接

运行 `aigne hub connect` 会提示选择：

```
? Choose a hub to connect:
❯ Official Hub (https://hub.aigne.io)
  Custom Hub URL
```

选择 "Custom Hub URL" 会要求输入自定义 Hub 地址。

#### 认证流程

连接时会自动启动浏览器进行 OAuth 认证：

1. 浏览器打开认证页面
2. 登录或注册 AIGNE Hub 账号
3. 授权应用访问
4. CLI 自动保存认证信息

### list - 列出已连接的 Hub

查看所有已连接的 AIGNE Hub。

```bash
aigne hub list
# 或
aigne hub ls
```

输出示例：

```
Connected AIGNE Hubs:

┌────────────────────────────────────────────┬────────┐
│ URL                                        │ ACTIVE │
├────────────────────────────────────────────┼────────┤
│ https://hub.aigne.io                       │ YES    │
│ https://custom-hub.example.com             │ NO     │
└────────────────────────────────────────────┴────────┘

Use 'aigne hub use' to switch to a different hub.
```

### use - 切换 Hub

切换到不同的 AIGNE Hub。

```bash
aigne hub use
```

CLI 会提示选择要切换到的 Hub：

```
? Choose a hub to switch to:
❯ https://hub.aigne.io
  https://custom-hub.example.com
```

### status - 查看 Hub 状态

查看已连接 Hub 的详细信息。

```bash
aigne hub status
# 或
aigne hub st
```

输出示例：

```
AIGNE Hub Connection
──────────────────────────────────────────────
Hub:       https://hub.aigne.io
Status:    Connected ✅

User:
  Name:    John Doe
  DID:     did:abt:z1abc123...
  Email:   john@example.com

Credits:
  Total:     100,000
  Used:      25,000
  Available: 75,000

Links:
  Payment:  https://hub.aigne.io/payment
  Credits:  https://hub.aigne.io/profile
```

### remove - 移除 Hub

从已连接列表中移除 Hub。

```bash
aigne hub remove
# 或
aigne hub rm
```

CLI 会提示选择要移除的 Hub：

```
? Choose a hub to remove:
❯ https://hub.aigne.io
  https://custom-hub.example.com
```

如果移除的是当前活跃的 Hub，CLI 会自动切换到列表中的下一个 Hub。

## AIGNE Hub 功能

### 什么是 AIGNE Hub

AIGNE Hub 是云端服务平台，提供：

- **远程代理管理**：在云端存储和分享代理
- **模型访问**：统一的 AI 模型访问接口
- **积分系统**：管理 API 使用额度
- **团队协作**：与团队成员共享资源

### 使用远程模型

连接到 Hub 后，可以使用远程模型：

```bash
# 使用 Hub 提供的模型
aigne run --model openai:gpt-4o-mini --aigne-hub-url https://hub.aigne.io
```

### 积分管理

查看积分使用情况：

```bash
aigne hub status
```

充值积分（会打开浏览器）：

```
Links:
  Payment: https://hub.aigne.io/payment
```

## 示例

### 示例 1：首次连接

```bash
# 连接到官方 Hub
aigne hub connect

# 查看连接状态
aigne hub status

# 使用 Hub 的模型运行代理
aigne run --model openai:gpt-4
```

### 示例 2：使用自定义 Hub

```bash
# 连接到私有 Hub
aigne hub connect https://private-hub.company.com

# 切换到私有 Hub
aigne hub use

# 查看所有已连接的 Hub
aigne hub list
```

### 示例 3：多 Hub 管理

```bash
# 连接多个 Hub
aigne hub connect https://hub.aigne.io
aigne hub connect https://dev-hub.example.com
aigne hub connect https://prod-hub.example.com

# 查看所有 Hub
aigne hub list

# 根据需要切换
aigne hub use  # 选择 dev-hub
# 开发工作...

aigne hub use  # 选择 prod-hub
# 生产操作...
```

### 示例 4：团队协作

```bash
# 连接到团队 Hub
aigne hub connect https://team-hub.company.com

# 使用团队共享的模型
aigne run --model openai:gpt-4 --aigne-hub-url https://team-hub.company.com
```

## 配置存储

Hub 连接信息安全存储在本地：

- **macOS**: Keychain
- **Windows**: Credential Manager  
- **Linux**: Secret Service API

可以手动查看存储的 Hub 列表：

```bash
aigne hub list
```

## 环境变量

可以通过环境变量覆盖 Hub 设置：

```bash
# 指定 Hub URL
export AIGNE_HUB_URL=https://custom-hub.example.com

# 指定 API 密钥
export AIGNE_HUB_API_KEY=your-api-key

# 运行代理
aigne run
```

## 故障排查

### 连接失败

```bash
# 检查网络连接
curl https://hub.aigne.io

# 检查 Hub 可用性
aigne hub connect https://hub.aigne.io
```

### 认证失败

如果认证失败，尝试重新连接：

```bash
# 移除旧连接
aigne hub remove

# 重新连接
aigne hub connect
```

### 积分不足

```bash
# 查看积分余额
aigne hub status

# 打开充值页面（在输出的 Links 中）
open https://hub.aigne.io/payment
```

## 安全建议

1. **保护 API 密钥**：不要在代码中硬编码 API 密钥
2. **定期更新**：定期检查和更新连接
3. **使用 HTTPS**：确保 Hub URL 使用 HTTPS
4. **限制权限**：在 Hub 中设置合适的权限级别

## 企业版功能

AIGNE Hub 企业版提供额外功能：

- **私有部署**：在内网部署私有 Hub
- **SSO 集成**：企业单点登录
- **审计日志**：详细的使用记录
- **自定义限额**：灵活的资源配额管理

联系 [sales@aigne.io](mailto:sales@aigne.io) 了解企业版详情。

## 下一步

- 查看 [run 命令](/commands/run.md) 了解如何使用 Hub 的模型
- 查看 [配置和环境](/configuration.md) 了解 Hub 相关的环境变量
- 访问 [AIGNE Hub 网站](https://hub.aigne.io) 了解更多功能

---

**相关命令：**
- [run](/commands/run.md) - 使用 Hub 模型运行代理
- [deploy](/commands/deploy.md) - 部署代理到 Hub
