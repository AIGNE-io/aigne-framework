# aigne hub

`aigne hub` 命令提供了一套工具，用于管理你与 AIGNE Hub 的连接。通过该命令，你可以直接在终端轻松地切换不同的 Hub 实例（例如官方 Arcblock hub 和自托管 hub）、检查账户状态、查看信用余额等。

### `hub list`

列出你之前连接过的所有 AIGNE Hub。

**用法**

```bash
aigne hub list
# 别名
aigne hub ls
```

**输出示例**

该命令会显示一个包含所有已保存连接的表格，并标明当前激活的是哪一个。

```text
已连接的 AIGNE Hub：

┌────────────────────────────────────────────────────────────────────┬──────────┐
│ URL                                                                │ 当前使用 │
├────────────────────────────────────────────────────────────────────┼──────────┤
│ https://hub.aigne.io                                               │ 是       │
├────────────────────────────────────────────────────────────────────┼──────────┤
│ https://my-custom-hub.example.com                                  │ 否       │
└────────────────────────────────────────────────────────────────────┴──────────┘
使用 'aigne hub use' 切换到不同的 hub。
```

### `hub connect`

与一个 AIGNE Hub 实例建立连接，并将凭证保存在本地。该过程需要通过你的 Web 浏览器进行认证。

**用法**

```bash
# 交互模式，选择官方或自定义 hub
aigne hub connect

# 指定 URL 的直接模式
aigne hub connect <hub-url>
```

**交互模式**

运行不带 URL 的 `aigne hub connect` 命令将出现一个交互式提示：

```text
? 请选择要连接的 hub：› - 使用箭头键选择，按回车键提交。
❯   官方 Hub (https://hub.aigne.io)
    自定义 Hub URL
```

选择并成功通过浏览器认证后，你将看到一条确认信息：

```text
✓ Hub https://hub.aigne.io 连接成功。
```

**直接模式**

提供 URL 作为参数来连接到一个特定的（通常是自托管的）hub。

```bash
aigne hub connect https://my-custom-hub.example.com
```

### `hub use`

将当前使用的 AIGNE Hub 切换到你之前连接过的一个实例。当前使用的 hub 将用于需要 Hub 服务的操作，例如运行由 Hub 提供的模型。

**用法**

```bash
aigne hub use
```

**示例**

该命令将提示你从已保存的连接列表中进行选择。

```text
? 请选择要切换到的 hub：› - 使用箭头键选择，按回车键提交。
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

选择后，当前使用的 hub 将被更改。

```text
✓ 已将当前使用的 hub 切换到 https://my-custom-hub.example.com
```

### `hub status`

显示当前使用的 AIGNE Hub 的 URL。

**用法**

```bash
aigne hub status
# 别名
aigne hub st
```

**输出示例**

```text
当前使用的 hub: https://hub.aigne.io - 在线
```

### `hub remove`

从本地配置文件中删除一个已保存的 AIGNE Hub 连接。

**用法**

```bash
aigne hub remove
# 别名
aigne hub rm
```

**示例**

系统将提示你选择要删除的已保存连接。

```text
? 请选择要删除的 hub：› - 使用箭头键选择，按回车键提交。
    https://hub.aigne.io
❯   https://my-custom-hub.example.com
```

确认后，连接将被删除。

```text
✓ Hub https://my-custom-hub.example.com 已删除
```

### `hub info`

获取并显示所选 hub 的详细账户信息，包括用户详情和信用余额。

**用法**

```bash
aigne hub info
# 别名
aigne hub i
```

**输出示例**

从交互式提示中选择一个 hub 后，将显示详细信息。

```text
AIGNE Hub 连接
──────────────────────────────────────────────
Hub:        https://hub.aigne.io
状态:     已连接 ✅

用户:
  姓名:     John Doe
  DID:      z2qA...p9Y
  邮箱:    john.doe@example.com

信用点:
  已用:     15,000
  总量:    1,000,000

链接:
  支付:  https://hub.aigne.io/billing
  个人资料:  https://hub.aigne.io/profile
```