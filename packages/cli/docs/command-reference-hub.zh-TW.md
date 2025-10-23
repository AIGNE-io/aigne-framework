---
labels: ["Reference"]
---

# aigne hub

`aigne hub` 指令是您管理 AIGNE Hub 連線的中央工具。Hub 提供對受管理的大型語言模型的存取、處理 API 金鑰管理，並追蹤您的點數使用情況。正確設定您的 Hub 連線對於執行使用 Hub 所提供模型的 Agent 至關重要。

此指令集可讓您連線到新的 Hub（包括官方 Arcblock Hub 和自行託管的實例）、列出您現有的連線、在它們之間切換，以及監控您的帳戶狀態。

## 用法

```bash 基本指令結構
aigne hub <subcommand>
```

## 指令

`aigne hub` 指令包含數個子指令，用於管理您 Hub 連線的不同方面。

| 指令 | 別名 | 說明 |
|---|---|---|
| `connect [url]` | | 連線到一個新的 AIGNE Hub。 |
| `list` | `ls` | 列出所有已設定的 AIGNE Hub 連線。 |
| `use` | | 切換當前作用中的 AIGNE Hub。 |
| `status` | `st` | 顯示當前作用中的 AIGNE Hub。 |
| `remove` | `rm` | 移除一個已設定的 AIGNE Hub 連線。 |
| `info` | `i` | 顯示特定 Hub 連線的詳細資訊。 |

---

### `connect [url]`

將您的本機 CLI 連線到一個 AIGNE Hub 實例。此過程會驗證您的機器，並將用於未來請求的 API 金鑰儲存在 `~/.aigne/aigne-hub-connected.yaml` 檔案中。

**用法**

```bash 連線到 Hub
aigne hub connect [url]
```

**行為**

- **互動模式**：如果您在執行指令時未提供 URL，將會出現一個互動式提示，讓您在官方 AIGNE Hub 或自訂的自行託管 Hub URL 之間進行選擇。

  ```bash 互動式連線 icon=mdi:console
  $ aigne hub connect
  ? Choose a hub to connect: › - Use arrow-keys. Return to submit.
  ❯   Official Hub (https://hub.aigne.io)
      Custom Hub URL
  ```

- **直接模式**：如果您提供一個 URL，CLI 將會直接嘗試連線到該特定的 Hub。

  ```bash 直接連線 icon=mdi:console
  $ aigne hub connect https://my-hub.example.com
  ```

在這兩種情況下，都會開啟一個瀏覽器視窗讓您進行身份驗證並授權 CLI 連線。完成後，憑證將會儲存在本機。

### `list`

顯示一個表格，列出您先前已連線的所有 AIGNE Hub。它也會標示出哪個 Hub 當前為作用中狀態。

**用法**

```bash 列出連線
aigne hub list
# or using the alias
aigne hub ls
```

**範例輸出**

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

切換作用中的 AIGNE Hub。當您有多個 Hub 連線（例如，個人帳戶和團隊帳戶）並且需要變更像 `aigne run` 這類指令預設使用的 Hub 時，此指令非常有用。

**用法**

```bash 切換作用中的 Hub
aigne hub use
```

**行為**

執行此指令將會顯示一個您已儲存的 Hub 連線的互動式列表。請選擇您希望設為作用中的連線。

```bash 互動式切換 icon=mdi:console
$ aigne hub use
? Choose a hub to switch to: › - Use arrow-keys. Return to submit.
    https://hub.aigne.io
❯   https://my-hub.example.com

✓ Switched active hub to https://my-hub.example.com
```

### `status`

快速顯示當前作用中的 AIGNE Hub 的 URL 及其連線狀態。

**用法**

```bash 檢查狀態
aigne hub status
# or using the alias
aigne hub st
```

**範例輸出**

```bash icon=mdi:console
$ aigne hub status
Active hub: https://hub.aigne.io - online
```

### `remove`

從您的本機設定檔中移除一個已儲存的 AIGNE Hub 連線。

**用法**

```bash 移除 Hub
aigne hub remove
# or using the alias
aigne hub rm
```

**行為**

此指令將以互動方式提示您選擇要移除哪個已儲存的 Hub 連線。

```bash 互動式移除 icon=mdi:console
$ aigne hub remove
? Choose a hub to remove: › https://my-hub.example.com

✓ Hub https://my-hub.example.com removed
```

### `info`

取得並顯示所選 Hub 連線的詳細帳戶資訊。這包括使用者詳細資料、點數餘額和重要連結。

**用法**

```bash 取得 Hub 資訊
aigne hub info
# or using the alias
aigne hub i
```

**行為**

首先，系統會提示您選擇一個已設定的 Hub。然後，CLI 將顯示其連線狀態和您的帳戶詳細資料。

**範例輸出**

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
