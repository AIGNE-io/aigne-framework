---
labels: ["Reference"]
---

---
labels: ["Reference"]
---

# aigne hub

`aigne hub` 命令提供了一套用于管理您与 AIGNE Hub 连接的工具。这使您可以轻松连接到官方 AIGNE Hub 或自托管实例，在它们之间切换，并直接从终端检查您的账户状态和积分余额。

您的连接详情本地存储在 `~/.aigne/aigne-hub-connected.yaml` 文件中。

```d2
direction: down

Developer-Machine: {
  label: "开发者机器"
  shape: rectangle

  aigne-CLI: {
    label: "aigne hub <command>"
    shape: rectangle
  }

  Local-Config: {
    label: "~/.aigne/aigne-hub-connected.yaml"
    shape: document
  }

  aigne-CLI -> Local-Config: {
    label: "读取/写入\n(list, use, connect, rm)"
    style.stroke-dash: 2
  }
}

AIGNE-Hub: {
  label: "AIGNE Hub (远程)"
  shape: cylinder
}

Browser: {
  label: "Web 浏览器\n（用于身份验证）"
  shape: rectangle
}

Developer-Machine.aigne-CLI -> Browser: {
  label: "1. `connect` 打开身份验证页面"
}

Browser -> AIGNE-Hub: {
  label: "2. 用户进行身份验证"
}

AIGNE-Hub -> Developer-Machine.aigne-CLI: {
  label: "3. CLI 轮询并接收 API 密钥"
}

Developer-Machine.aigne-CLI -> AIGNE-Hub: {
  label: "API 调用 (info, status)"
  style.stroke-width: 2
}
```

## 子命令

### `hub list`

列出您之前连接过的所有 AIGNE Hub，并指明当前活动的 Hub。

**用法**

```bash
aigne hub list
# Alias
aigne hub ls
```

**示例输出**

```text
已连接的 AIGNE Hubs：

┌────────────────────────────────────────────────────────────────────┬──────────┐
│ URL                                                                │ 活动     │
├────────────────────────────────────────────────────────────────────┼──────────┤
│ https://hub.aigne.io                                               │ 是       │
├────────────────────────────────────────────────────────────────────┼──────────┤
│ https://my-custom-hub.example.com                                  │ 否       │
└────────────────────────────────────────────────────────────────────┴──────────┘
使用 'aigne hub use' 切换到不同的 Hub。
```

### `hub connect`

与一个 AIGNE Hub 实例建立新连接。此命令将打开一个 Web 浏览器进行身份验证，成功后，会将凭据保存到您的本地配置中。

**用法**

```bash
# 启动交互式提示以选择一个 Hub
aigne hub connect

# 直接连接到指定的 Hub URL
aigne hub connect <hub-url>
```

**交互模式**

运行不带 URL 的 `aigne hub connect` 会提供一个交互式提示，让您在官方 AIGNE Hub 或自定义 Hub 之间进行选择。

```text
? 选择要连接的 Hub：› 
❯   官方 Hub (https://hub.aigne.io)
    自定义 Hub URL
```

**直接模式**

要连接到自托管或特定的 AIGNE Hub 实例，请将其 URL 作为参数提供。

```bash
aigne hub connect https://my-custom-hub.example.com
```

在浏览器中成功进行身份验证后，终端将显示一条确认消息：

```text
✓ Hub https://hub.aigne.io 连接成功。
```

### `hub use`

将活动的 AIGNE Hub 切换到另一个先前连接的实例。活动 Hub 默认用于需要 Hub 服务的操作，例如使用 Hub 提供的模型。

**用法**

```bash
aigne hub use
```

此命令将显示一个已保存连接的交互式列表供您选择。

```text
? 选择要切换到的 Hub：› 
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

选择后，您将收到一条确认信息：

```text
✓ 已将活动 Hub 切换到 https://my-custom-hub.example.com
```

### `hub status`

显示当前活动的 AIGNE Hub 的 URL 及其连接状态。

**用法**

```bash
aigne hub status
# Alias
aigne hub st
```

**示例输出**

```text
活动 Hub：https://hub.aigne.io - 在线
```

### `hub remove`

从您的本地配置文件中移除一个已保存的 AIGNE Hub 连接。

**用法**

```bash
aigne hub remove
# Alias
aigne hub rm
```

此命令会提示您选择要删除哪个已保存的连接。

```text
? 选择要移除的 Hub：› 
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

选择后，连接将被移除：

```text
✓ Hub https://my-custom-hub.example.com 已移除
```

### `hub info`

获取并显示所选 Hub 的详细账户信息，包括用户详情、积分余额和相关链接。

**用法**

```bash
aigne hub info
# Alias
aigne hub i
```

从交互式提示中选择一个 Hub 后，您将看到一份详细的状态报告。

**示例输出**

```text
AIGNE Hub 连接
──────────────────────────────────────────────
Hub:        https://hub.aigne.io
状态:       已连接 ✅

用户:
  姓名:     John Doe
  DID:      z2qA...p9Y
  邮箱:    john.doe@example.com

积分:
  已用:     15,000
  总计:    1,000,000

链接:
  支付:  https://hub.aigne.io/billing
  个人资料:  https://hub.aigne.io/profile
```