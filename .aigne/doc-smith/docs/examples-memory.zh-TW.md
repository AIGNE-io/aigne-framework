# 記憶體

想建立一個能記住您的聊天機器人嗎？本指南將示範如何使用 AIGNE 框架和 `FSMemory` 外掛程式來建立一個具有持久記憶體的聊天機器人。您將學習如何讓 Agent 回憶起先前對話的資訊，從而實現更具連續性和上下文感知能力的互動。

## 總覽

一個聊天機器人要真正有效，就需要記住過去的互動。本範例展示如何使用 `FSMemory` 外掛程式來實現這一點，該外掛程式將對話資料儲存到本機檔案系統中。這使得聊天機器人能夠在不同會話之間保持狀態，提供更個人化的使用者體驗。

本文件將引導您執行範例、將其連接到 AI 模型，並理解記憶體如何被記錄和擷取的機制。若想了解使用去中心化儲存的另一種持久化方法，請參閱 [DID Spaces 記憶體](./examples-memory-did-spaces.md)範例。

## 先決條件

在開始之前，請確保您具備以下條件：

*   **Node.js**：版本 20.0 或更高。
*   **OpenAI API 金鑰**：需要 API 金鑰才能連接到 OpenAI 模型。您可以從 [OpenAI Platform](https://platform.openai.com/api-keys) 取得。

## 快速入門

得益於 `npx`，您可以直接在終端機中執行此範例，無需在本機安裝。

### 執行範例

執行以下指令。第一個指令給予聊天機器人一條資訊，第二個指令測試其回憶該資訊的能力。

```sh 使用記憶體執行聊天機器人 icon=lucide:terminal
npx -y @aigne/example-memory --input 'I like blue color'
npx -y @aigne/example-memory --input 'What is my favorite color?'
```

若想進行更自然的來回對話，您可以在互動模式下啟動聊天機器人。

```sh 在互動式聊天模式下執行 icon=lucide:terminal
npx -y @aigne/example-memory --chat
```

### 連接到 AI 模型

Agent 需要連接到 AI 模型才能運作。首次執行範例時，系統會提示您選擇一種連接方法。

#### 1. AIGNE Hub (建議)

最簡單的方法是透過官方 AIGNE Hub 連接。選擇第一個選項，您的瀏覽器將會開啟以進行身份驗證。新使用者會自動獲得豐厚的 token 配額以供入門使用。

![連線至 AIGNE Hub](../images/connect-to-aigne-hub.png)

#### 2. 自行託管的 AIGNE Hub

如果您的組織使用自行託管的 AIGNE Hub，請選擇第二個選項並提供您實例的 URL 進行連接。

![連線至自行託管的 AIGNE Hub](../images/connect-to-self-hosted-aigne-hub.png)

#### 3. 第三方模型供應商

您也可以直接連接到像 OpenAI 這樣的第三方供應商。為此，請在執行範例前將您的 API 金鑰設定為環境變數。

```sh 設定您的 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="your_openai_api_key_here"
```

設定金鑰後，再次執行 `npx` 指令。更多設定範例，請參閱專案原始碼中的 `.env.local.example` 檔案。

## 本機安裝

如果您希望檢查程式碼或進行修改，可以在本機設定專案。

### 1. 複製儲存庫

首先，從 GitHub 複製 `aigne-framework` 儲存庫。

```sh 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

導覽至範例的目錄，並使用 `pnpm` 安裝所需的套件。

```sh 安裝依賴項 icon=lucide:terminal
cd aigne-framework/examples/memory
pnpm install
```

### 3. 執行範例

安裝完依賴項後，您可以使用 `start` 指令碼執行範例。

```sh 在本機執行範例 icon=lucide:terminal
pnpm start
```

## 記憶體如何運作

記憶體功能由 AIGNE 框架的增強檔案系統 (AFS) 中的兩個核心模組提供支援：`history` 和 `UserProfileMemory`。

### 記錄對話

1.  **歷史記錄**：當使用者傳送訊息且 AI 回應時，這個對話配對會被儲存到 AFS 的 `history` 模組中。
2.  **個人資料提取**：`UserProfileMemory` 模組會分析對話並提取關於使用者的關鍵細節，例如他們的名字或偏好。這些資訊隨後會被分別儲存在 AFS 的 `user_profile` 模組中。

### 擷取對話

當使用者傳送新訊息時，框架會擷取儲存的資訊，為 AI 模型提供必要的上下文。

1.  **注入使用者個人資料**：系統首先載入使用者的個人資料，並將其直接注入到系統提示中的 `<related-memories>` 區塊內。這確保了 Agent 能立即意識到關鍵事實。

    ```text 帶有記憶體的系統提示
    You are a friendly chatbot
    
    <related-memories>
    - |
      name:
        - name: Bob
      interests:
        - content: likes blue color
    
    </related-memories>
    ```

2.  **注入對話歷史**：接下來，最近的對話歷史會被格式化為一系列訊息。這段歷史與系統提示一起被傳送給 AI 模型。

    ```json 注入的聊天訊息
    [
      {
        "role": "system",
        "content": "You are a friendly chatbot ..." 
      },
      {
        "role": "user",
        "content": [{ "type": "text", "text": "I'm Bob and I like blue color" }]
      },
      {
        "role": "agent",
        "content": [{ "type": "text", "text": "Nice to meet you, Bob! Blue is a great color.\n\nHow can I help you today?" }]
      },
      {
        "role": "user",
        "content": [{ "type": "text", "text": "What is my favorite color?" }]
      }
    ]
    ```

3.  **生成回應**：AI 模型處理整個負載——系統提示、使用者個人資料和聊天歷史——以生成一個符合上下文的回應。

    **AI 回應：**
    ```text
    You mentioned earlier that you like the color blue
    ```

## 偵錯

若要檢查 Agent 的行為，請使用 `aigne observe` 指令。這會啟動一個本機網頁伺服器，提供一個詳細且使用者友善的介面來檢視執行追蹤。它是偵錯、效能調整以及理解您的 Agent 如何處理資訊的重要工具。

![執行 aigne observe](../images/aigne-observe-execute.png)

一旦執行，您就可以存取網頁使用者介面，查看最近執行的列表，並深入了解每次呼叫的詳細資訊。

![aigne observe 中最近執行的列表](../images/aigne-observe-list.png)

## 總結

本範例展示了如何使用 AIGNE 框架建立一個具有持久記憶體的聊天機器人。透過利用 `FSMemory` 外掛程式，Agent 可以儲存和回憶對話歷史及使用者個人資料，從而創造更智慧化和個人化的互動。

若需進一步閱讀，請探索以下相關主題：

<x-cards data-columns="2">
  <x-card data-title="DID Spaces 記憶體" data-icon="lucide:database" data-href="/examples/memory-did-spaces">
    了解如何使用 DID Spaces 進行記憶體的去中心化儲存持久化。
  </x-card>
  <x-card data-title="核心概念：記憶體" data-icon="lucide:brain-circuit" data-href="/developer-guide/core-concepts/memory">
    深入探討 AIGNE 框架中記憶體背後的架構概念。
  </x-card>
</x-cards>