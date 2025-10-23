---
labels: ["Reference"]
---

# 內建應用程式

AIGNE CLI 附帶預先封裝的應用程式，提供專門、開箱即用的功能。這些應用程式是完整的 AIGNE 專案，您可以直接執行，無需先初始化本地專案。

當您首次調用內建應用程式時，CLI 會自動從 npm 註冊庫中獲取其套件，將其安裝到本地快取 (`~/.aigne/`) 中，然後執行它。後續執行會使用快取版本以加快啟動速度，並定期檢查是否有新更新，以確保您擁有最新功能。

## 可用的應用程式

以下是目前可用的內建應用程式：

| 命令 | 別名 | 說明 |
|---|---|---|
| `doc` | `docsmith` | 產生並維護專案文件 — 由 agents 驅動。 |
| `web` | `websmith` | 產生並維護專案網站頁面 — 由 agents 驅動。 |

## Doc Smith (`aigne doc`)

Doc Smith 是一款功能強大的應用程式，旨在使用 AI agents 自動產生和維護專案文件。

### 使用方式

您可以使用 `aigne doc` 命令與 Doc Smith 互動。Doc Smith 應用程式中定義的 agents 可作為子命令使用。

例如，要為您目前的專案產生文件，您需要執行其 `generate` agent：

```bash title="產生專案文件" icon=lucide:terminal
# 執行 'generate' agent 來建立或更新文件
aigne doc generate
```

## Web Smith (`aigne web`)

Web Smith 是一款專注於為您的專案產生和維護網頁的應用程式，例如登陸頁面、功能展示或部落格。

### 使用方式

與 Doc Smith 類似，您使用 `aigne web` 命令，後面跟著 Web Smith 應用程式中某個 agent 的名稱。

例如，要產生一個新網頁：

```bash title="產生一個新網頁" icon=lucide:terminal
# 執行一個 agent 來建立新頁面
aigne web generate
```

## 通用命令

由於內建應用程式是完整的 AIGNE 專案，它們支援您可以直接應用於其上的標準命令。

### 升級

為確保您擁有應用程式的最新版本，您可以執行 `upgrade` 命令。此命令將檢查 npm 上是否有較新版本，並在可用時進行安裝。

```bash title="升級 Doc Smith" icon=lucide:terminal
aigne doc upgrade
```

### 作為 MCP 伺服器提供服務

您可以將應用程式的 agents 作為標準模型情境協議 (Model Context Protocol, MCP) 服務公開，讓其他系統可以透過 HTTP 與它們互動。

```bash title="提供 Doc Smith agents 服務" icon=lucide:terminal
aigne doc serve-mcp
```

有關伺服器選項的完整列表，請參閱 [`aigne serve-mcp`](./command-reference-serve-mcp.md) 命令參考。
