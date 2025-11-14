# MCP DID Spaces

本文件提供了一份透過模型情境協定（Model Context Protocol, MCP）將聊天機器人與 DID Spaces 整合的綜合指南。遵循這些說明，您將能夠建立一個 AI Agent，該 Agent 可以安全地存取和管理去中心化儲存環境中的檔案，並利用 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 的功能。

## 先決條件

為確保此範例成功執行，請確認已安裝並設定下列元件：

*   **Node.js**：版本 20.0 或更新版本。
*   **OpenAI API 金鑰**：AI 模型需要有效的 API 金鑰。金鑰可從 [OpenAI Platform](https://platform.openai.com/api-keys) 取得。
*   **DID Spaces MCP 伺服器憑證**：與您指定的 DID Space 互動時，需要身份驗證詳細資訊。

## 快速入門

此範例可使用 `npx` 直接從您的終端機執行，無需本機安裝。

### 1. 設定環境變數

首先，使用您的 DID Spaces 伺服器憑證設定環境變數。您空間的 URL 和存取金鑰可以從您的 Blocklet 管理設定中產生。

```bash 設定 DID Spaces 憑證 icon=lucide:terminal
# 以您的 DID Spaces 應用程式 URL 取代
export DID_SPaces_URL="https://spaces.staging.arcblock.io/app"

# 在個人資料 -> 設定 -> 存取金鑰中建立一個金鑰，並將驗證類型設定為「Simple」
export DID_SPACES_AUTHORIZATION="blocklet-xxx"
```

### 2. 執行範例

設定好環境變數後，執行以下指令以初始化聊天機器人。

```bash 執行範例 icon=lucide:terminal
npx -y @aigne/example-mcp-did-spaces
```

### 3. 連線至 AI 模型

聊天機器人需要連線至一個大型語言模型（LLM）才能運作。首次執行時，會出現一個提示，引導您完成連線設定。

![AI 模型連線的初始提示](../../../examples/mcp-did-spaces/run-example.png)

建立連線主要有三種方法：

#### 選項 1：AIGNE Hub（建議）

這是最直接的方法。官方的 AIGNE Hub 為新使用者提供免費的權杖。若要使用此選項，請在提示中選擇第一個選項。您的網頁瀏覽器將開啟 AIGNE Hub 授權頁面，您可以在此核准連線請求。

![授權 AIGNE Hub 連線](../../../examples/images/connect-to-aigne-hub.png)

#### 選項 2：自架 AIGNE Hub

對於正在營運私有 AIGNE Hub 執行個體的使用者，請選擇第二個選項。系統會提示您輸入自架 Hub 的 URL。關於部署個人 AIGNE Hub 的說明，請參閱 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ)。

![連線至自架的 AIGNE Hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 選項 3：第三方模型提供者

也支援與第三方 LLM 提供者（如 OpenAI）直接整合。將對應的 API 金鑰設定為環境變數，然後再次執行執行指令。

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

有關其他設定範例，包括像 DeepSeek 和 Google Gemini 這樣的提供者，請參閱原始碼儲存庫中的 `.env.local.example` 檔案。

一旦 AI 模型連線成功，此範例將對您的 DID Space 執行一系列測試操作，將結果記錄到主控台，並產生一個總結結果的 markdown 檔案。

## 運作原理

此範例使用一個 `MCPAgent`，透過模型情境協定（MCP）與 DID Spaces 伺服器互動。此協定使 Agent 能夠動態發現並利用「技能」，這些技能直接對應到 DID Spaces 的功能。

下圖說明了其運作流程：

```d2
direction: down

AI-Agent: {
  label: "AI Agent"
  shape: rectangle
}

MCPAgent: {
  label: "MCPAgent"
  shape: rectangle
}

DID-Spaces-Server: {
  label: "DID Spaces MCP 伺服器"
  shape: rectangle

  Skills: {
    label: "可用技能"
    shape: rectangle
    list-objects: "list_objects"
    write-object: "write_object"
    read-object: "read_object"
    head-space: "head_space"
    delete-object: "delete_object"
  }
}

DID-Space: {
  label: "DID Space"
  shape: cylinder
}

AI-Agent -> MCPAgent: "3. 執行指令\n（例如：'列出檔案'）"
MCPAgent -> DID-Spaces-Server: "1. 連線並驗證"
DID-Spaces-Server -> MCPAgent: "2. 提供技能"
MCPAgent -> DID-Space: "4. 透過技能執行操作"

```

運作流程如下：
1. `MCPAgent` 連線至指定的 DID Spaces MCP 伺服器端點。
2. 它使用提供的授權憑證進行身份驗證。
3. 伺服器向 Agent 提供一組技能，例如 `list_objects` 和 `write_object`。
4. `MCPAgent` 整合這些技能，使主要的 AI Agent 能夠根據使用者輸入或程式邏輯，在 DID Space 內執行檔案和資料管理任務。

### 可用技能

此整合將幾個關鍵的 DID Spaces 操作作為技能暴露出來，供 Agent 使用：

| 技能 | 描述 |
| --------------- | ---------------------------------------------- |
| `head_space` | 擷取關於 DID Space 的元資料。 |
| `read_object` | 讀取指定物件（檔案）的內容。 |
| `write_object` | 將新內容寫入物件（檔案）。 |
| `list_objects` | 列出目錄中的所有物件（檔案）。 |
| `delete_object` | 刪除指定的物件（檔案）。 |

## 設定

對於生產環境部署，應更新 Agent 設定，以指向您特定的 MCP 伺服器並使用安全的身份驗證權杖。`MCPAgent` 在實例化時需提供伺服器 URL 和適當的授權標頭。

```typescript agent-config.ts icon=logos:typescript
const mcpAgent = await MCPAgent.from({
  url: "YOUR_MCP_SERVER_URL",
  transport: "streamableHttp",
  opts: {
    requestInit: {
      headers: {
        Authorization: "Bearer YOUR_TOKEN",
      },
    },
  },
});
```

## 偵錯

`aigne observe` 指令提供了一個工具，用於監控和分析 Agent 的執行期行為。它會啟動一個本機網頁伺服器，將執行追蹤視覺化，提供關於輸入、輸出、工具互動和效能指標的深入資訊。

1. **啟動觀察伺服器：**

    ```bash aigne observe icon=lucide:terminal
    aigne observe
    ```

    ![AIGNE Observe 伺服器在終端機中啟動](../../../examples/images/aigne-observe-execute.png)

2. **檢視執行追蹤：**

    存取 `http://localhost:7893` 的網頁介面，以檢視最近的 Agent 執行列表。可以檢查每個追蹤，以詳細分析 Agent 的操作。

    ![AIGNE Observe 追蹤列表](../../../examples/images/aigne-observe-list.png)

## 本機安裝與測試

對於打算修改原始碼的開發者，以下步驟概述了本機設定和測試的流程。

### 1. 複製儲存庫

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

切換到範例的目錄，並使用 `pnpm` 安裝所需的套件。

```bash icon=lucide:terminal
cd aigne-framework/examples/mcp-did-spaces
pnpm install
```

### 3. 執行範例

執行啟動腳本，從本機原始碼執行應用程式。

```bash icon=lucide:terminal
pnpm start
```

### 4. 執行測試

若要驗證整合與功能，請執行測試套件。

```bash icon=lucide:terminal
pnpm test:llm
```

測試過程將建立與 MCP 伺服器的連線，列舉可用技能，並執行基本的 DID Spaces 操作，以確認整合功能是否如預期般運作。