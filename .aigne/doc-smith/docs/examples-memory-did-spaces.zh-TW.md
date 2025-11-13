本文件將引導您使用 DID Spaces 和 AIGNE 框架建立一個具有持久性記憶體的聊天機器人。您將學習如何利用 `DIDSpacesMemory` 外掛程式，讓您的 Agent 能夠以安全、去中心化的方式在多個會話中保留對話歷史。

# DID Spaces Memory

## 總覽

本範例展示如何將持久性記憶體整合到 AI Agent 中。與會忘記過去互動的無狀態聊天機器人不同，本範例展示了一個能夠儲存使用者個人資料資訊、從先前的對話中回憶偏好，並根據儲存的記憶體提供個人化回應的 Agent。

此功能是使用 `@aigne/agent-library` 中的 `DIDSpacesMemory` 外掛程式實現的，該外掛程式連接到 DID Spaces 實例以儲存和擷取對話歷史。

## 前置需求

在繼續之前，請確保已安裝並設定好以下項目：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨 Node.js 一起安裝。
*   **OpenAI API 金鑰**：語言模型所需。可從 [OpenAI 平台](https://platform.openai.com/api-keys)取得。
*   **DID Spaces 憑證**：記憶體持久化所需。

## 快速入門

您可以使用 `npx` 直接從您的終端機執行此範例，無需在本機安裝。

### 1. 執行範例

在您的終端機中執行以下指令：

```bash memory-did-spaces icon=lucide:terminal
npx -y @aigne/example-memory-did-spaces
```

### 2. 連接到 AI 模型

該 Agent 需要連接到一個大型語言模型。首次執行時，系統會提示您連接到一個模型提供商。

![Connect to an AI Model](https://static.AIGNE.io/aigne-docs/images/examples/run-example.png)

您有多個連接選項：

*   **AIGNE Hub (官方)**：這是最簡單的方法。您的瀏覽器將開啟官方的 AIGNE Hub，您可以在那裡登入。新使用者會收到免費的 token，可以立即開始實驗。

    ![Connect to Official AIGNE Hub](https://static.AIGNE.io/aigne-docs/images/examples/connect-to-aigne-hub.png)

*   **AIGNE Hub (自行託管)**：如果您有自己運維的 AIGNE Hub 實例，請選擇此選項並輸入其 URL。您可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 部署一個自行託管的 AIGNE Hub。

    ![Connect to Self-Hosted AIGNE Hub](https://static.AIGNE.io/aigne-docs/images/examples/connect-to-self-hosted-aigne-hub.png)

*   **第三方模型提供商**：您可以直接連接到像 OpenAI 這樣的提供商。為此，請在執行指令前將您的 API 金鑰設定為環境變數。

    ```bash 匯出 OpenAI 金鑰 icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    有關使用 DeepSeek 或 Google Gemini 等提供商的更多設定選項，請參閱原始碼儲存庫中的 `.env.local.example` 檔案。

設定好模型連接後，再次執行 `npx` 指令以啟動聊天機器人。

## 本機安裝與執行

對於希望檢視原始碼或進行修改的開發者，請按照以下步驟在本機執行範例。

### 1. 複製儲存庫

首先，複製官方的 AIGNE 框架儲存庫：

```bash 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

導覽至範例的目錄並使用 pnpm 安裝所需的依賴項。

```bash 安裝依賴項 icon=lucide:terminal
cd aigne-framework/examples/memory-did-spaces
pnpm install
```

### 3. 執行範例

透過執行 `start` 腳本來啟動應用程式。

```bash 執行範例 icon=lucide:terminal
pnpm start
```

該腳本將執行一系列測試以展示記憶體功能，將結果儲存到一個 Markdown 檔案中，並在控制台中顯示該檔案的路徑供您查閱。

## 運作原理

本範例利用 `DIDSpacesMemory` 外掛程式為 Agent 提供持久且去中心化的記憶體。下圖說明了此工作流程：

```d2
direction: down

User: {
  shape: c4-person
}

AI-Agent: {
  label: "AI Agent"
  shape: rectangle

  DIDSpacesMemory-Plugin: {
    label: "DIDSpacesMemory 外掛程式"
  }
}

DID-Spaces: {
  label: "DID Spaces"
  shape: cylinder
  icon: "https://www.arcblock.io/image-bin/uploads/fb3d25d6fcd3f35c5431782a35bef879.svg"
}

User -> AI-Agent: "2. 使用者發送訊息"
AI-Agent -> User: "7. Agent 發送具備上下文的回應"

AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "1. 使用憑證進行初始化"
AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "3. 擷取對話歷史"
DID-Spaces -> AI-Agent.DIDSpacesMemory-Plugin: "4. 為 Agent 提供上下文"
AI-Agent -> AI-Agent.DIDSpacesMemory-Plugin: "5. 處理新的互動"
AI-Agent.DIDSpacesMemory-Plugin -> DID-Spaces: "6. 儲存更新後的歷史"

```

過程如下：

1.  **初始化**：使用 `DIDSpacesMemory` 外掛程式初始化 Agent，並設定 DID Spaces 實例的 URL 和身份驗證憑證。
2.  **互動**：當您與聊天機器人對話時，每個使用者的輸入和 Agent 的回應都會被記錄下來。
3.  **儲存**：`DIDSpacesMemory` 外掛程式會自動將對話歷史儲存到您指定的 DID Space 中。
4.  **擷取**：在後續的會話中，外掛程式會擷取過去的對話歷史，為 Agent 提供記住先前互動所需的上下文。

這種去中心化的方法確保了記憶體是安全、私密且可攜的，並由使用者的 DID 控制。

## 設定

此範例包含一個預先設定好的 DID Spaces 端點，僅供示範。對於生產環境，您必須更新設定以指向您自己的實例。

此設定在實例化 `DIDSpacesMemory` 外掛程式時應用：

```typescript memory-config.ts icon=logos:typescript
import { DIDSpacesMemory } from '@aigne/agent-library';

// ...

const memory = new DIDSpacesMemory({
  url: "YOUR_DID_SPACES_URL",
  auth: {
    authorization: "Bearer YOUR_AUTHENTICATION_TOKEN",
  },
});
```

請將 `"YOUR_DID_SPACES_URL"` 和 `"Bearer YOUR_AUTHENTICATION_TOKEN"` 替換為您特定的端點和憑證。

## 偵錯

要監控和分析 Agent 的行為，請使用 `aigne observe` 指令。此工具會啟動一個本機 Web 伺服器，提供 Agent 執行追蹤的詳細視圖。這是偵錯、理解資訊流和優化效能的重要工具。

要啟動觀察伺服器，請執行：

```bash aigne-observe icon=lucide:terminal
aigne observe
```

![AIGNE Observe Execution](https://static.AIGNE.io/aigne-docs/images/examples/aigne-observe-execute.png)

Web 介面將顯示最近執行的列表，讓您能夠檢查每次執行的輸入、輸出、工具呼叫和模型互動。

![AIGNE Observe List](https://static.AIGNE.io/aigne-docs/images/examples/aigne-observe-list.png)

## 總結

本範例提供了一個功能性示範，展示了如何使用 AIGNE 框架和 DID Spaces 將持久、去中心化的記憶體整合到 AI Agent 中。透過遵循本指南，您可以建立更智慧、更具上下文感知能力的聊天機器人。

如需進一步閱讀，請參閱以下部分：
<x-cards data-columns="2">
  <x-card data-title="記憶體概念" data-href="/developer-guide/core-concepts/memory" data-icon="lucide:book-open">了解更多關於記憶體在 AIGNE 框架中的運作方式。</x-card>
  <x-card data-title="框架範例" data-href="/examples" data-icon="lucide:layout-template">探索其他實際範例和使用案例。</x-card>
</x-cards>