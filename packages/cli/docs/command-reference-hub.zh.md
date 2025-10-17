---
labels: ["Reference"]
---

# aigne hub

`aigne hub` 命令是您管理 AIGNE Hub 连接的中心工具。Hub 提供对托管大语言模型的访问、处理 API 密钥管理并跟踪您的信用额度使用情况。正确配置您的 Hub 连接对于运行使用 Hub 提供的模型的 Agent 至关重要。

此命令集允许您连接到新的 Hub（包括官方 Arcblock Hub 和自托管实例）、列出现有连接、在它们之间切换以及监控您的账户状态。

## 用法

```bash 基本命令结构
aigne hub <subcommand>
```

## 命令

`aigne hub` 命令包含几个子命令，用于管理 Hub 连接的不同方面。

| 命令 | 别名 | 描述 |
|---|---|---|
| `connect [url]` | | 连接到一个新的 AIGNE Hub。 |
| `list` | `ls` | 列出所有已配置的 AIGNE Hub 连接。 |
| `use` | | 切换活动的 AIGNE Hub。 |
| `status` | `st` | 显示当前活动的 AIGNE Hub。 |
| `remove` | `rm` | 移除一个已配置的 AIGNE Hub 连接。 |
| `info` | `i` | 显示特定 Hub 连接的详细信息。 |

---

### `connect [url]`

将您的本地 CLI 连接到 AIGNE Hub 实例。此过程会验证您的计算机，并将用于未来请求的 API 密钥存储在 `~/.aigne/aigne-hub-connected.yaml` 文件中。

**用法**

```bash 连接到 Hub
aigne hub connect [url]
```

**行为**

- **交互模式**：如果您在不带 URL 的情况下运行该命令，将出现一个交互式提示，允许您在官方 AIGNE Hub 或自定义的自托管 Hub URL 之间进行选择。

  ```bash 交互式连接 icon=mdi:console
  $ aigne hub connect
  ? Choose a hub to connect: › - Use arrow-keys. Return to submit.
  ❯   Official Hub (https://hub.aigne.io)
      Custom Hub URL
  ```

- **直接模式**：如果您提供一个 URL，CLI 将尝试直接连接到该特定的 Hub。

  ```bash 直接连接 icon=mdi:console
  $ aigne hub connect https://my-hub.example.com
  ```

在这两种情况下，都会打开一个浏览器窗口供您进行身份验证并授权 CLI 连接。完成后，凭据将保存在本地。

### `list`

显示您之前连接过的所有 AIGNE Hub 的表格。它还会指示哪个 Hub 当前处于活动状态。

**用法**

```bash 列出连接
aigne hub list
# 或使用别名
aigne hub ls
```

**示例输出**

```bash icon=mdi:table
$ aigne hub ls
Connected AIGNE Hubs:

┌───────────────────────────────────────────────────┬────────┐
│ URL                                               │ ACTIVE │
├───────────────────────────────────────────────────┼────────┤
│ https://hub.aigne.io                              │ YES    │
├───────────────────────────────────────────────────┼────────┤
│ https://my-hub.example.com                        │ NO     │
└───────────────────────────────────────────────────┴────────┘
Use 'aigne hub use' to switch to a different hub.
```

### `use`

切换活动的 AIGNE Hub。当您有多个 Hub 连接（例如，个人账户和团队账户）并且需要更改 `aigne run` 等命令默认使用的连接时，此命令非常有用。

**用法**

```bash 切换活动 Hub
aigne hub use
```

**行为**

运行此命令将显示一个交互式列表，其中包含您已保存的 Hub 连接。选择您希望激活的连接。

```bash 交互式切换 icon=mdi:console
$ aigne hub use
? Choose a hub to switch to: › - Use arrow-keys. Return to submit.
    https://hub.aigne.io
❯   https://my-hub.example.com

✓ Switched active hub to https://my-hub.example.com
```

### `status`

快速显示当前活动的 AIGNE Hub 的 URL 及其连接状态。

**用法**

```bash 检查状态
aigne hub status
# 或使用别名
aigne hub st
```

**示例输出**

```bash icon=mdi:console
$ aigne hub status
Active hub: https://hub.aigne.io - online
```

### `remove`

从您的本地配置文件中移除一个已保存的 AIGNE Hub 连接。

**用法**

```bash 移除 Hub
aigne hub remove
# 或使用别名
aigne hub rm
```

**行为**

此命令将以交互方式提示您选择要移除的已保存 Hub 连接。

```bash 交互式移除 icon=mdi:console
$ aigne hub remove
? Choose a hub to remove: › https://my-hub.example.com

✓ Hub https://my-hub.example.com removed
```

### `info`

获取并显示所选 Hub 连接的详细账户信息。这包括用户详细信息、信用额度余额和重要链接。

**用法**

```bash 获取 Hub 信息
aigne hub info
# 或使用别名
aigne hub i
```

**行为**

首先，系统会提示您选择一个已配置的 Hub。然后，CLI 将显示其连接状态和您的账户详细信息。

**示例输出**

```bash icon=mdi:information-outline
$ aigne hub info

AIGNE Hub Connection
──────────────────────────────────────────────
Hub:       https://hub.aigne.io
Status:    Connected ✅

User:
  Name:    John Doe
  DID:     z2qa...w9vM
  Email:   john.doe@example.com

Credits:
  Used:    1,234
  Total:   100,000

Links:
  Payment: https://hub.aigne.io/payment/...
  Profile: https://hub.aigne.io/profile/...
```
