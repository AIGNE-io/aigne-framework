# DID Spaces 記憶體

本指南將示範如何使用 DID Spaces 建構具備永久記憶體的聊天機器人。透過利用 AIGNE 框架中的 `DIDSpacesMemory` 外掛程式，您的 agent 能夠以去中心化且安全的方式，在多個會話之間保留對話歷史記錄。

## 先決條件

在開始之前，請確保您已安裝並設定好以下項目：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨您的 Node.js 一併安裝。
*   **OpenAI API 金鑰**：連接語言模型所需。您可以從 [OpenAI Platform](https://platform.openai.com/api-keys) 取得金鑰。
*   **DID Spaces 憑證**：記憶體持久化所需。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需任何本地安裝。

### 1. 執行範例

在您的終端機中執行以下指令：

```bash 執行 memory-did-spaces 範例 icon=lucide:terminal
npx -y @aigne/example-memory-did-spaces
```

### 2. 連接至 AI 模型

首次執行時，由於尚未設定任何 API 金鑰，CLI 將提示您連接至 AI 模型。

![run-example.png](../../../examples/memory-did-spaces/run-example.png)

您有以下幾個選項可以繼續：

*   **透過官方 AIGNE Hub 連接（建議）**
    這是最簡單的入門方式。選擇此選項將在您的網頁瀏覽器中開啟官方 AIGNE Hub 的驗證頁面。請依照畫面上的指示連接您的錢包。新用戶會自動獲得 400,000 個權杖的歡迎獎勵。

    ![連接至官方 AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

*   **透過自行託管的 AIGNE Hub 連接**
    如果您有自己的 AIGNE Hub 實例，請選擇此選項。系統將提示您輸入自行託管的 Hub 的 URL 以完成連接。您可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 部署您自己的 AIGNE Hub。

    ![連接至自行託管的 AIGNE Hub](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

*   **透過第三方模型供應商連接**
    您也可以直接連接至第三方供應商，如 OpenAI、DeepSeek 或 Google Gemini。為此，您需要將供應商的 API 金鑰設定為環境變數。例如，要使用 OpenAI，請設定 `OPENAI_API_KEY` 變數：

    ```bash 在此設定您的 OpenAI API 金鑰 icon=lucide:terminal
    export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
    ```

    設定環境變數後，再次執行 `npx` 指令。

## 本地安裝與執行

如果您偏好從原始碼執行此範例，請依照以下步驟操作。

### 1. 複製儲存庫

首先，從 GitHub 複製 AIGNE 框架儲存庫：

```bash icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴套件

導覽至範例的目錄，並使用 `pnpm` 安裝所需的依賴套件：

```bash icon=lucide:terminal
cd aigne-framework/examples/memory-did-spaces
pnpm install
```

### 3. 執行範例

最後，啟動範例：

```bash icon=lucide:terminal
pnpm start
```

該腳本將執行三個測試，以展示記憶體功能：儲存使用者設定檔、回憶偏好設定，以及根據已儲存的資料建立投資組合。結果將顯示在主控台中，並儲存到一個 markdown 報告檔案中供您檢視。

## 運作原理

此範例利用了 `@aigne/agent-library` 套件中的 `DIDSpacesMemory` 外掛程式。此外掛程式透過將對話歷史記錄儲存至 DID Spaces（一個去中心化的個人資料儲存解決方案），使 agent 能夠持久化儲存對話。

主要功能包括：
*   **去中心化持久性**：對話被安全地儲存在使用者的 DID Space 中。
*   **會話連續性**：即使在重新啟動後，聊天機器人也能回憶起先前互動中的資訊。
*   **隱私與安全**：使用者資料使用去中心化識別碼（DID）技術進行管理，確保隱私和使用者控制權。

此範例透過儲存使用者設定檔詳細資訊、在新的互動中回憶這些資訊，並利用記憶的上下文提供個人化建議來展示此功能。

## 設定

雖然此範例為示範目的預先設定了一個 DID Spaces 端點，但您需要為生產應用程式更新設定。這包括設定您自己的 DID Spaces 實例，並在程式碼中提供正確的 URL 和驗證憑證。

```typescript memory-config.ts
import { DIDSpacesMemory } from '@aigne/agent-library';

const memory = new DIDSpacesMemory({
  url: "YOUR_DID_SPACES_URL",
  auth: {
    authorization: "Bearer YOUR_TOKEN",
  },
});
```

請將 `"YOUR_DID_SPACES_URL"` 和 `"Bearer YOUR_TOKEN"` 替換為您實際的端點和驗證權杖。

## 使用 AIGNE Observe 進行偵錯

要監控和偵錯您的 agent 執行情況，您可以使用 `aigne observe` 指令。此工具會啟動一個本地 Web 伺服器，提供 agent 追蹤的詳細視圖，幫助您了解其行為、診斷問題並優化效能。

要啟動觀察伺服器，請執行：

```bash icon=lucide:terminal
aigne observe
```

![AIGNE Observe 伺服器啟動中](../../../examples/images/aigne-observe-execute.png)

執行後，您可以在瀏覽器中開啟提供的 URL（預設為 `http://localhost:7893`），以檢視最近的 agent 執行列表並檢查其詳細資訊。

![AIGNE Observe 追蹤列表](../../../examples/images/aigne-observe-list.png)

## 總結

本範例展示了如何使用 `DIDSpacesMemory` 外掛程式將去中心化的永久記憶體整合到 AI agent 中。此功能讓您能夠建立更精密、更具上下文感知能力的聊天機器人，這些機器人能記住跨會話的使用者互動。

若要了解更多相關概念，請參閱以下文件：

<x-cards data-columns="2">
  <x-card data-title="Memory" data-href="/developer-guide/core-concepts/memory" data-icon="lucide:brain-circuit">
   了解 AIGNE 框架中 agent 記憶體的核心概念。
  </x-card>
  <x-card data-title="檔案系統記憶體" data-href="/examples/memory" data-icon="lucide:folder">
   探索另一個使用本地檔案系統進行記憶體持久化的範例。
  </x-card>
</x-cards>