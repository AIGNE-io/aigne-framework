---
labels: ["Reference"]
---

# aigne hub

`aigne hub` 命令提供了一套用于管理您与 AIGNE Hub 连接的工具。通过该命令，您可以直接在终端中轻松切换不同的 Hub 实例（例如官方 Arcblock Hub 和自托管 Hub）、检查账户状态、查看信用额度等。

## 子命令

### `hub list`

列出您之前连接过的所有 AIGNE Hub。

**用法**

```bash
aigne hub list
# 别名
aigne hub ls
```

**示例输出**

该命令会显示一个包含所有已保存连接的表格，并标明当前活动的连接。

```text
已连接的 AIGNE Hub：

┌────────────────────────────────────────────────────────────────────┬──────────┐
│ URL                                                                │ 活动     │
├────────────────────────────────────────────────────────────────────┼──────────┤
│ https://hub.aigne.io                                               │ 是       │
├────────────────────────────────────────────────────────────────────┼──────────┤
│ https://my-custom-hub.example.com                                  │ 否       │
└────────────────────────────────────────────────────────────────────┴──────────┘
使用 'aigne hub use' 切换到不同的 hub。
```

### `hub connect`

与一个 AIGNE Hub 实例建立连接，并将凭据保存在本地。此过程需要通过您的 Web 浏览器进行身份验证。

**用法**

```bash
# 交互模式，可选择官方或自定义 hub
aigne hub connect

# 直接模式，使用特定 URL
aigne hub connect <hub-url>
```

**交互模式**

运行不带 URL 的 `aigne hub connect` 命令将显示一个交互式提示：

```text
? 请选择要连接的 hub：› 
❯   官方 Hub (https://hub.aigne.io)
    自定义 Hub URL
```

选择并成功通过浏览器验证后，您将看到一条确认消息：

```text
✓ Hub https://hub.aigne.io 连接成功。
```

**直接模式**

将 URL 作为参数提供，以连接到特定的（通常是自托管的）hub。

```bash
aigne hub connect https://my-custom-hub.example.com
```

### `hub use`

将当前活动的 AIGNE Hub 切换到您之前连接过的一个实例。活动 hub 用于需要 Hub 服务的操作，例如运行 Hub 提供的模型。

**用法**

```bash
aigne hub use
```

**示例**

该命令将提示您从已保存的连接列表中进行选择。

```text
? 请选择要切换到的 hub：› 
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

选择后，活动的 hub 将被更改。

```text
✓ 已将活动 hub 切换到 https://my-custom-hub.example.com
```

### `hub status`

显示当前活动的 AIGNE Hub 的 URL。

**用法**

```bash
aigne hub status
# 别名
aigne hub st
```

**示例输出**

```text
活动 hub: https://hub.aigne.io - 在线
```

### `hub remove`

从本地配置文件中删除已保存的 AIGNE Hub 连接。

**用法**

```bash
aigne hub remove
# 别名
aigne hub rm
```

**示例**

系统将提示您选择要移除的已保存连接。

```text
? 请选择要移除的 hub：› 
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

确认后，该连接将被删除。

```text
✓ Hub https://my-custom-hub.example.com 已移除
```

### `hub info`

获取并显示所选 hub 的详细账户信息，包括用户详情和信用额度。

**用法**

```bash
aigne hub info
# 别名
aigne hub i
```

**示例输出**

从交互式提示中选择一个 hub 后，将显示详细信息。

```text
AIGNE Hub 连接
──────────────────────────────────────────────
Hub:        https://hub.aigne.io
状态:       已连接 ✅

用户:
  姓名:     John Doe
  DID:      z2qA...p9Y
  邮箱:    john.doe@example.com

信用额度:
  已使用:     15,000
  总计:    1,000,000

链接:
  支付:  https://hub.aigne.io/billing
  个人资料:  https://hub.aigne.io/profile
```

此命令便于在不离开终端的情况下快速检查您的账户详情和信用额度。