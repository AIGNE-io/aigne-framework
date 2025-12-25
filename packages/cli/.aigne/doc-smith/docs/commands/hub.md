# hub - Hub 管理

`aigne hub` 命令用于管理与 AIGNE Hub 的连接,包括连接、切换、查看状态和删除 Hub。

## 命令格式

```bash
aigne hub <subcommand> [options]
```

## 子命令

| 子命令 | 说明 | 别名 |
|--------|------|------|
| `connect [url]` | 连接到 AIGNE Hub | - |
| `list` | 列出所有已连接的 Hub | `ls` |
| `use` | 切换活动的 Hub | - |
| `status` | 显示 Hub 详细信息 | `st` |
| `remove` | 删除已连接的 Hub | `rm` |

## connect - 连接 Hub

连接到 AIGNE Hub 服务。

### 命令格式

```bash
aigne hub connect [url]
```

### 参数说明

- **`[url]`**（可选）：Hub 的 URL
  - 如果省略,将进入交互式选择界面

### 使用示例

#### 交互式连接

```bash
aigne hub connect
```

系统会提示选择：

```
? Choose a hub to connect:
❯ Official Hub (https://hub.aigne.io)
  Custom Hub URL
```

选择 "Custom Hub URL" 后输入自定义 URL：

```
? Enter the URL of your AIGNE Hub: https://my-hub.example.com
```

#### 直接连接

指定 Hub URL 直接连接：

```bash
# 连接到官方 Hub
aigne hub connect https://hub.aigne.io

# 连接到自定义 Hub
aigne hub connect https://my-hub.example.com
```

### 认证流程

连接 Hub 时会：

1. 验证 URL 可访问性
2. 打开浏览器进行认证
3. 获取 API 密钥
4. 保存连接信息
5. 设置为默认 Hub

成功输出：

```
✓ Hub https://hub.aigne.io connected successfully.
```

## list - 列出 Hub

列出所有已连接的 AIGNE Hub。

### 命令格式

```bash
aigne hub list
# 或
aigne hub ls
```

### 输出示例

```
Connected AIGNE Hubs:

┌──────────────────────────────────────────────┬────────┐
│ URL                                          │ ACTIVE │
├──────────────────────────────────────────────┼────────┤
│ https://hub.aigne.io                         │ YES    │
│ https://custom-hub.example.com               │ NO     │
└──────────────────────────────────────────────┴────────┘

Use 'aigne hub use' to switch to a different hub.
```

### 无连接情况

如果没有已连接的 Hub：

```
No AIGNE Hub connected.
Use 'aigne hub connect' to connect to a hub.
```

## use - 切换 Hub

切换活动的 AIGNE Hub。

### 命令格式

```bash
aigne hub use
```

### 使用示例

```bash
aigne hub use
```

系统会显示可用的 Hub 列表：

```
? Choose a hub to switch to:
❯ https://hub.aigne.io
  https://custom-hub.example.com
```

选择后切换成功：

```
✓ Switched active hub to https://custom-hub.example.com
```

### 切换效果

切换 Hub 后：
- 后续的 Agent 运行会使用新 Hub
- API 调用会发送到新 Hub
- 信用额度从新 Hub 扣除

## status - 查看状态

显示已连接 Hub 的详细信息。

### 命令格式

```bash
aigne hub status
# 或
aigne hub st
```

### 使用示例

```bash
aigne hub status
```

如果有多个 Hub,系统会提示选择：

```
? Choose a hub to view info:
❯ https://hub.aigne.io (connected)
  https://custom-hub.example.com
```

### 输出示例

```
AIGNE Hub Connection
──────────────────────────────────────────────
Hub:       https://hub.aigne.io
Status:    Connected ✅

User:
  Name:    John Doe
  DID:     z8mWaJHXieAh9W6qyVFKp4qKU
  Email:   john@example.com

Credits:
  Total:      1,000,000
  Used:       245,680
  Available:  754,320

Links:
  Payment:    https://hub.aigne.io/payment
  Credits:    https://hub.aigne.io/profile
```

字段说明：
- **Hub**：Hub 服务地址
- **Status**：连接状态（Connected 表示当前活动）
- **User**：用户信息
- **Credits**：信用额度信息（如果启用）
- **Links**：相关链接（充值、个人中心等）

### 无信用额度功能

如果 Hub 未启用信用额度功能,不会显示 Credits 和 Links 部分。

## remove - 删除 Hub

删除已连接的 Hub。

### 命令格式

```bash
aigne hub remove
# 或
aigne hub rm
```

### 使用示例

```bash
aigne hub remove
```

系统会提示选择要删除的 Hub：

```
? Choose a hub to remove:
❯ https://hub.aigne.io
  https://custom-hub.example.com
```

删除成功：

```
✓ Hub https://custom-hub.example.com removed
```

### 删除活动 Hub

如果删除的是当前活动的 Hub：

1. 自动切换到剩余的第一个 Hub
2. 显示切换信息：
   ```
   ✓ Hub https://hub.aigne.io removed, switched to https://custom-hub.example.com
   ```

3. 如果没有其他 Hub,则清除默认设置

## Hub 配置

### 存储位置

Hub 连接信息存储在系统密钥存储中：
- **macOS**：Keychain
- **Windows**：Credential Manager
- **Linux**：Secret Service API / libsecret

### 配置内容

每个 Hub 连接包含：
- Hub URL (`AIGNE_HUB_API_URL`)
- API 密钥 (`AIGNE_HUB_API_KEY`)
- 是否为默认 Hub

### 默认 Hub

- 只能有一个默认 Hub
- 默认 Hub 用于所有 Agent 操作
- 可以通过 `hub use` 切换

## 使用场景

### 多环境管理

为不同环境使用不同的 Hub：

```bash
# 开发环境
aigne hub connect https://dev-hub.example.com
aigne run

# 切换到生产环境
aigne hub use
# 选择生产 Hub
aigne run
```

### 团队协作

团队成员可以：
1. 连接到团队的共享 Hub
2. 共享模型配置和资源
3. 统一管理信用额度

### 企业内部 Hub

连接到企业内部部署的 Hub：

```bash
aigne hub connect https://internal-hub.company.com
```

## 信用额度

### 查看额度

使用 `hub status` 查看剩余信用额度：

```bash
aigne hub status
```

### 充值

如果显示充值链接,可以访问链接进行充值：

```
Links:
  Payment: https://hub.aigne.io/payment
```

### 额度不足

当信用额度不足时：
- API 调用可能失败
- 需要及时充值
- 查看使用记录

## 安全考虑

### API 密钥保护

- API 密钥存储在系统密钥库中
- 不会明文存储在文件中
- 使用系统级加密保护

### Hub URL 验证

连接 Hub 时会验证：
- URL 格式正确
- 使用 HTTPS 协议
- 服务器可访问

### 权限管理

- 每个 API 密钥有特定权限
- 不同 Hub 隔离
- 可以随时删除连接

## 故障排查

### 连接失败

**问题**：无法连接到 Hub

**解决方案**：
- 检查网络连接
- 验证 Hub URL 正确
- 检查防火墙设置
- 尝试访问 Hub 网页版

### 认证失败

**问题**：无法完成认证流程

**解决方案**：
- 确认浏览器打开
- 检查登录信息
- 清除浏览器缓存
- 联系 Hub 管理员

### 信用额度显示异常

**问题**：信用额度显示不正确

**解决方案**：
- 刷新状态：重新运行 `hub status`
- 检查 Hub 服务状态
- 联系 Hub 支持

### 无法切换 Hub

**问题**：切换 Hub 失败

**解决方案**：
- 确认目标 Hub 已连接
- 检查 Hub 连接状态
- 尝试重新连接

## Hub 工作流程

<!-- afs:image id="img-009" key="hub-workflow" desc="AIGNE Hub workflow diagram: connect → authenticate → store credentials → set as default → use in agent operations" -->

典型的 Hub 使用流程：

1. **连接 Hub**：
   ```bash
   aigne hub connect
   ```

2. **查看状态**：
   ```bash
   aigne hub status
   ```

3. **使用 Agent**：
   ```bash
   aigne run
   # Agent 自动使用当前 Hub
   ```

4. **切换 Hub**（可选）：
   ```bash
   aigne hub use
   ```

5. **管理连接**：
   ```bash
   aigne hub list
   aigne hub remove
   ```

## 最佳实践

1. **保持连接更新**：定期检查 Hub 连接状态
2. **环境隔离**：为开发和生产使用不同的 Hub
3. **监控额度**：定期查看信用额度余额
4. **安全连接**：只连接信任的 Hub
5. **备用 Hub**：配置多个 Hub 作为备份

## 导航

### 父主题

- [命令参考](../commands.md) - 返回命令列表

### 相关主题

- [run 命令](./run.md) - 使用 Hub 运行 Agent
- [配置说明](../configuration.md) - Hub 配置选项

### 下一步

- [配置说明](../configuration.md) - 了解更多配置选项
