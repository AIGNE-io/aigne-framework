# hub

`hub` 命令是您管理与 AIGNE Hub 连接的门户。它允许您登录、在不同的 Hub 实例之间切换、查看您的帐户状态等。连接到 AIGNE Hub 可以简化 API 密钥管理，并让您访问更广泛的 AI 模型和功能。

## 命令

### connect

建立与 AIGNE Hub 的连接。当您运行此命令时，它将在您的网络浏览器中打开一个新页面来验证您的帐户。成功登录后，您的凭据将安全地存储在您的本地计算机上。

**用法**

```bash
aigne hub connect [url]
```

**参数**

*   `url` (可选): 您要连接的 AIGNE Hub 的 URL。如果您不提供 URL，系统将提示您在官方 AIGNE Hub 和自定义 Hub 之间进行选择。

**示例**

通过交互式提示进行连接：
```bash
aigne hub connect
```

您将看到如下提示：
```
? Choose a hub to connect: › - Use arrow-keys. Return to submit.
❯   Official Hub (https://hub.aigne.io)
    Custom Hub URL
```

直接连接到特定的 Hub 实例：
```bash
aigne hub connect https://my-custom-hub.com
```

成功连接后，您将看到一条确认消息：
```bash
✓ Hub https://hub.aigne.io connected successfully.
```

### list

列出您之前在计算机上连接过的所有 AIGNE Hub。当前活动的 hub 标记为 `YES`。

**用法**

```bash
aigne hub list
# 别名
aigne hub ls
```

**示例**

```bash
$ aigne hub list

Connected AIGNE Hubs:

┌─────────────────────────────────────────┬────────┐
│ URL                                     │ ACTIVE │
├─────────────────────────────────────────┼────────┤
│ https://hub.aigne.io                    │ YES    │
├─────────────────────────────────────────┼────────┤
│ https://my-custom-hub.com               │ NO     │
└─────────────────────────────────────────┴────────┘
Use 'aigne hub use' to switch to a different hub.
```

### use

从您保存的连接列表中，将活动连接切换到另一个 AIGNE Hub。此命令将提供一个交互式的已连接 hub 列表供您选择。

**用法**

```bash
aigne hub use
```

**示例**

```bash
$ aigne hub use

? Choose a hub to switch to: › https://my-custom-hub.com
✓ Switched active hub to https://my-custom-hub.com
```

### status

显示已连接 hub 的详细信息，包括您的用户个人资料、信用点余额和连接状态。这对于检查您的可用信用点和帐户详细信息很有用。

**用法**

```bash
aigne hub status
# 别名
aigne hub st
```

**示例**

从交互式提示中选择一个 hub 后，您将看到详细的状态报告：
```
AIGNE Hub Connection
──────────────────────────────────────────────
Hub:       https://hub.aigne.io
Status:    Connected ✅

User:
  Name:      John Doe
  DID:       z1... (your DID)
  Email:     john.doe@example.com

Credits:
  Total:     100,000
  Used:      20,000
  Available: 80,000

Links:
  Payment:   https://hub.aigne.io/payment
  Credits:   https://hub.aigne.io/profile
```

### remove

从您的本地配置中删除一个先前保存的 AIGNE Hub 连接。此操作不会删除您在 Hub 上的帐户，只会删除本地凭据。

**用法**

```bash
aigne hub remove
# 别名
aigne hub rm
```

**示例**

此命令将启动一个交互式提示，要求您选择要删除的 hub 连接。

```bash
$ aigne hub remove

? Choose a hub to remove: › https://my-custom-hub.com
✓ Hub https://my-custom-hub.com removed
```