---
labels: ["Reference"]
---

# aigne serve-mcp

將 AIGNE 專案中的 Agent 作為模型上下文協定（MCP）伺服器來運行。此命令會透過一個可串流的 HTTP 端點公開您的 Agent，使其能與支援 MCP 標準的外部系統和應用程式無縫整合。

在內部，`aigne serve-mcp` 會啟動一個輕量級的 Express 伺服器。當在設定的端點上收到 POST 請求時，它會調用對應的 Agent，並根據 MCP 規範將回應以串流方式回傳。

![執行 MCP 服務](../assets/run-mcp-service.png)

## 用法

```bash 基本用法 icon=lucide:terminal
aigne serve-mcp [options]
```

## 選項

`serve-mcp` 命令接受以下選項來自訂伺服器的行為：

<x-field data-name="--path, --url" data-type="string" data-default="." data-desc="本地 Agent 目錄的路徑，或遠端 AIGNE 專案的 URL。"></x-field>

<x-field data-name="--host" data-type="string" data-default="localhost" data-desc="執行 MCP 伺服器的主機。使用 `0.0.0.0` 可將伺服器公開到網路上。"></x-field>

<x-field data-name="--port" data-type="number" data-default="3000" data-desc="MCP 伺服器的連接埠。如果設定了 `PORT` 環境變數，此命令會優先使用該變數；否則，預設為 3000。"></x-field>

<x-field data-name="--pathname" data-type="string" data-default="/mcp" data-desc="MCP 服務端點的 URL 路徑。"></x-field>

<x-field data-name="--aigne-hub-url" data-type="string" data-desc="自訂的 AIGNE Hub 服務 URL，用於獲取遠端的 Agent 定義或模型。"></x-field>

## 範例

### 為本地專案啟動伺服器

若要從當前目錄提供 Agent 服務，請直接執行不含任何選項的命令。伺服器將在預設的主機和連接埠上啟動。

```bash 在當前目錄啟動伺服器 icon=lucide:play-circle
aigne serve-mcp
```

**預期輸出：**

```text 控制台輸出 icon=lucide:server
MCP server is running on http://localhost:3000/mcp
```

### 在指定的連接埠和路徑上提供 Agent 服務

您可以指定不同的連接埠，並提供 AIGNE 專案目錄的明確路徑。

```bash 使用自訂連接埠和路徑啟動伺服器 icon=lucide:play-circle
aigne serve-mcp --path ./my-ai-project --port 8080
```

**預期輸出：**

```text 控制台輸出 icon=lucide:server
MCP server is running on http://localhost:8080/mcp
```

### 將伺服器公開到網路

若要讓網路上的其他機器能夠存取您的 MCP 伺服器，請將主機設定為 `0.0.0.0`。

```bash 公開伺服器 icon=lucide:play-circle
aigne serve-mcp --host 0.0.0.0
```

**預期輸出：**

```text 控制台輸出 icon=lucide:server
MCP server is running on http://0.0.0.0:3000/mcp
```

## 後續步驟

透過 MCP 伺服器公開您的 Agent 後，您可能會想將它們部署到生產環境中。

<x-cards>
  <x-card data-title="aigne deploy 命令" data-icon="lucide:ship" data-href="/command-reference/deploy">
    了解如何將您的 AIGNE 應用程式部署為 Blocklet。
  </x-card>
  <x-card data-title="部署 Agent 指南" data-icon="lucide:book-open-check" data-href="/guides/deploying-agents">
    遵循逐步教學來部署您的 Agent。
  </x-card>
</x-cards>
