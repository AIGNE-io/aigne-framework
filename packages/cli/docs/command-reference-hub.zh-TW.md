---
labels: ["Reference"]
---

---
labels: ["參考"]
---

# aigne hub

`aigne hub` 指令是您管理 AIGNE Hub 連線的中央工具。Hub 提供對受管理大型語言模型的存取、處理 API 金鑰管理，並追蹤您的信用額度使用情況。正確設定您的 Hub 連線對於執行使用 Hub 所提供模型的 Agent 至關重要。

這組指令讓您可以連線到新的 Hub（包括官方 Arcblock Hub 和自行託管的實例）、列出您現有的連線、在它們之間切換，以及監控您的帳戶狀態。

## 用法

```bash 基本指令結構
aigne hub <subcommand>
```

## 指令

`aigne hub` 指令包含數個子指令，用於管理您 Hub 連線的不同方面。

| 指令 | 別名 | 描述 |
|---|---|---|
| `connect [url]` | | 連線到一個新的 AIGNE Hub。 |
| `list` | `ls` | 列出所有已設定的 AIGNE Hub 連線。 |
| `use` | | 切換作用中的 AIGNE Hub。 |
| `status` | `st` | 顯示目前作用中的 AIGNE Hub。 |
| `remove` | `rm` | 移除一個已設定的 AIGNE Hub 連線。 |
| `info` | `i` | 顯示特定 Hub 連線的詳細資訊。 |

---

### `connect [url]`

將您的本地 CLI 連線到一個 AIGNE Hub 實例。此過程會驗證您的機器，並將用於未來請求的 API 金鑰儲存在 `~/.aigne/aigne-hub-connected.yaml` 檔案中。

**用法**

```bash 連線到 Hub
aigne hub connect [url]
```

**行為**

- **互動模式**：如果您在執行指令時未提供 URL，將會出現一個互動式提示，讓您在官方 AIGNE Hub 或自訂的自行託管 Hub URL 之間進行選擇。

  ```bash 互動式連線 icon=mdi:console
  $ aigne hub connect
  ? 請選擇要連線的 hub： › - 使用方向鍵。按 Enter 提交。
  ❯   官方 Hub (https://hub.aigne.io)
      自訂 Hub URL
  ```

- **直接模式**：如果您提供了 URL，CLI 將會直接嘗試連線到該特定的 Hub。

  ```bash 直接連線 icon=mdi:console
  $ aigne hub connect https://my-hub.example.com
  ```

在這兩種情況下，都會開啟一個瀏覽器視窗供您驗證並授權 CLI 連線。完成後，憑證將會儲存在本地。

### `list`

顯示一個包含您先前已連線的所有 AIGNE Hub 的表格。它也會標示哪個 Hub 目前為作用中狀態。

**用法**

```bash 列出連線
aigne hub list
# 或使用別名
aigne hub ls
```

**範例輸出**

```bash icon=mdi:table
$ aigne hub ls
已連線的 AIGNE Hubs：

┌───────────────────────────────────────────────────┬────────┐
│ URL                                               │ 作用中 │
├───────────────────────────────────────────────────┼────────┤
│ https://hub.aigne.io                              │ 是    │
├───────────────────────────────────────────────────┼────────┤
│ https://my-hub.example.com                        │ 否     │
└───────────────────────────────────────────────────┴────────┘
使用 'aigne hub use' 來切換到不同的 hub。
```

### `use`

切換作用中的 AIGNE Hub。當您有多個 Hub 連線（例如，個人帳戶和團隊帳戶）並且需要更改像 `aigne run` 這類指令預設使用的 Hub 時，此指令非常有用。

**用法**

```bash 切換作用中 Hub
aigne hub use
```

**行為**

執行此指令將會顯示一個您已儲存的 Hub 連線的互動式列表。請選擇您希望設為作用中的連線。

```bash 互動式切換 icon=mdi:console
$ aigne hub use
? 請選擇要切換到的 hub： › - 使用方向鍵。按 Enter 提交。
    https://hub.aigne.io
❯   https://my-hub.example.com

✓ 已將作用中 hub 切換至 https://my-hub.example.com
```

### `status`

快速顯示目前作用中的 AIGNE Hub 的 URL 及其連線狀態。

**用法**

```bash 檢查狀態
aigne hub status
# 或使用別名
aigne hub st
```

**範例輸出**

```bash icon=mdi:console
$ aigne hub status
作用中 hub: https://hub.aigne.io - 線上
```

### `remove`

從您的本地設定檔中移除一個已儲存的 AIGNE Hub 連線。

**用法**

```bash 移除 Hub
aigne hub remove
# 或使用別名
aigne hub rm
```

**行為**

此指令將會以互動方式提示您選擇要移除哪個已儲存的 Hub 連線。

```bash 互動式移除 icon=mdi:console
$ aigne hub remove
? 請選擇要移除的 hub： › https://my-hub.example.com

✓ Hub https://my-hub.example.com 已移除
```

### `info`

取得並顯示所選 Hub 連線的詳細帳戶資訊。這包括使用者詳細資料、信用額度餘額和重要連結。

**用法**

```bash 取得 Hub 資訊
aigne hub info
# 或使用別名
aigne hub i
```

**行為**

首先，系統會提示您選擇一個已設定的 Hub。然後，CLI 將會顯示其連線狀態和您的帳戶詳細資料。

**範例輸出**

```bash icon=mdi:information-outline
$ aigne hub info

AIGNE Hub 連線
──────────────────────────────────────────────
Hub:       https://hub.aigne.io
狀態:    已連線 ✅

使用者:
  姓名:    John Doe
  DID:     z2qa...w9vM
  電子郵件:   john.doe@example.com

信用額度:
  已使用:    1,234
  總計:   100,000

連結:
  付款: https://hub.aigne.io/payment/...
  個人資料: https://hub.aigne.io/profile/...
```