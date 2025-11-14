<content>
# 記憶體

本指南提供了建置能記住先前對話的聊天機器人的逐步流程。遵循這些說明，您將建立一個有狀態的 Agent，它使用 `FSMemory` 外掛程式來持久化會話資料，從而實現連續且具有情境感知能力的互動。

## 總覽

此範例示範如何使用 AIGNE 框架在聊天機器人中實現記憶體功能。該 Agent 利用 `FSMemory` 外掛程式，將對話歷史和使用者個人資料資訊儲存在本機檔案系統上。這使得聊天機器人能夠回憶起會話中的過往互動，提供更個人化且連貫的使用者體驗。

## 先決條件

在繼續之前，請確保您的開發環境符合以下要求：

*   **Node.js**：版本 20.0 或更高。
*   **npm**：隨 Node.js 安裝一同提供。
*   **OpenAI API 金鑰**：連接 OpenAI 模型所需。您可以從 [OpenAI API keys](https://platform.openai.com/api-keys) 頁面取得金鑰。

## 快速入門

您可以使用 `npx` 直接執行此範例，無需本機安裝。

### 執行範例

在您的終端機中執行以下指令，與啟用記憶體的聊天機器人互動。第一個指令告知機器人您的偏好，第二個指令測試其回憶該資訊的能力。

```bash 執行帶有記憶體的聊天機器人 icon=lucide:terminal
# 發送第一則訊息以建立一個事實
npx -y @aigne/example-memory --input 'I like blue color'

# 發送第二則訊息以測試聊天機器人的記憶體
npx -y @aigne/example-memory --input 'What is my favorite color?'
```

若要進行連續對話，請在互動模式下執行聊天機器人：

```bash 在互動式聊天模式下執行 icon=lucide:terminal
npx -y @aigne/example-memory --chat
```

### 連接至 AI 模型

聊天機器人需要連接至大型語言模型 (LLM) 才能運作。如果您尚未設定模型提供者，CLI 將在首次執行時提示您選擇一種連接方式。

![AI 模型的初始連接提示](../../../examples/memory/run-example.png)

您有三種主要選項來連接 AI 模型：

#### 1. 透過官方 AIGNE Hub 連接（建議）

這是最簡單的方法。AIGNE Hub 是一項提供多種模型存取權的服務，並為新使用者提供免費額度。

1.  選擇第一個選項：`Connect to the Arcblock official AIGNE Hub`。
2.  您的網頁瀏覽器將打開 AIGNE Hub 授權頁面。
3.  按照螢幕上的指示批准連接。新使用者將獲得 400,000 個 token 的免費贈款。

![授權 AIGNE CLI 連接至 AIGNE Hub](../../../examples/images/connect-to-aigne-hub.png)

#### 2. 透過自架的 AIGNE Hub 連接

如果您的組織執行 AIGNE Hub 的私有實例，您可以直接連接到它。

1.  選擇第二個選項：`Connect to your self-hosted AIGNE Hub`。
2.  在提示時輸入您自架的 AIGNE Hub 實例的 URL。
3.  按照後續提示完成連接。

有關部署自架 AIGNE Hub 的說明，請參閱 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ)。

![輸入自架 AIGNE Hub 的 URL](../../../examples/images/connect-to-self-hosted-aigne-hub.png)

#### 3. 透過第三方模型提供者連接

您可以透過將適當的 API 金鑰設定為環境變數，直接連接到第三方模型提供者，例如 OpenAI。

例如，若要連接到 OpenAI，請設定 `OPENAI_API_KEY` 環境變數：

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key" # 替換為您的實際金鑰
```

設定環境變數後，再次執行範例。有關支援的提供者及其對應環境變數的列表，請參閱 [`.env.local.example`](https://github.com/AIGNE-io/aigne-framework/blob/main/examples/memory/.env.local.example) 檔案。

## 記憶體如何運作

記憶體功能是使用 `history` 和 `UserProfileMemory` 模組實現的，這些模組是 AIGNE 框架的增強檔案系統 (AFS) 的一部分。

下圖說明了聊天機器人如何記錄和檢索資訊，以在對話中維持情境。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AI-Agent: {
    label: "AI Agent"
  }

  UserProfileMemory: {
    label: "UserProfileMemory"
  }

  AFS: {
    label: "增強檔案系統 (AFS)"
    shape: rectangle
    style: {
      stroke: "#888"
      stroke-width: 2
      stroke-dash: 4
    }

    history: {
      label: "history"
      shape: cylinder
    }

    user-profile: {
      label: "user_profile"
      shape: cylinder
    }
  }
}

AI-Model: {
  label: "AI 模型 (LLM)"
}

# 記錄流程
User -> AIGNE-Framework.AI-Agent: "1. 發送訊息"
AIGNE-Framework.AI-Agent -> User: "2. 接收回應"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.history: "3. 儲存對話"
AIGNE-Framework.UserProfileMemory -> AIGNE-Framework.AFS.history: "4. 分析歷史記錄"
AIGNE-Framework.UserProfileMemory -> AIGNE-Framework.AFS.user-profile: "5. 儲存提取的個人資料"

# 檢索流程
User -> AIGNE-Framework.AI-Agent: "6. 發送新訊息"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.user-profile: "7. 載入使用者個人資料"
AIGNE-Framework.AI-Agent -> AIGNE-Framework.AFS.history: "8. 載入聊天歷史記錄"
AIGNE-Framework.AI-Agent -> AI-Model: "9. 發送帶有情境的提示"
AI-Model -> AIGNE-Framework.AI-Agent: "10. 產生回應"
AIGNE-Framework.AI-Agent -> User: "11. 傳遞有根據的回應"
```

### 記錄對話

1.  在使用者發送訊息並收到回應後，該對話配對（使用者輸入和 AI 輸出）將被儲存到 AFS 中的 `history` 模組。
2.  同時，`UserProfileMemory` 模組會分析對話歷史，以提取和推斷使用者個人資料的詳細資訊（例如，姓名、偏好）。然後，這些資訊將被儲存在 AFS 中的 `user_profile` 模組。

### 檢索對話

當收到新的使用者訊息時，框架會檢索已儲存的資訊，為 AI 模型提供情境。

1.  **載入使用者個人資料**：Agent 從 `UserProfileMemory` 載入資料，並將其注入到系統提示中。這確保 AI 從一開始就了解使用者的個人資料。

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

2.  **注入對話歷史**：來自 `history` 模組的近期對話回合將附加到訊息列表中，提供即時的對話情境。

    ```json 帶有歷史記錄的聊天訊息
    [
      {
        "role": "system",
        "content": "You are a friendly chatbot ..."
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "I'm Bob and I like blue color"
          }
        ]
      },
      {
        "role": "agent",
        "content": [
          {
            "type": "text",
            "text": "Nice to meet you, Bob! Blue is a great color.\n\nHow can I help you today?"
          }
        ]
      },
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is my favorite color?"
          }
        ]
      }
    ]
    ```

3.  **產生回應**：AI 模型處理完整的上下文——包括帶有使用者個人資料的系統提示和近期的聊天歷史——以產生一個有根據的回應。

    **AI 回應：**

    ```text
    You mentioned earlier that you like the color blue
    ```

## 偵錯

若要監控和分析 Agent 的行為，您可以使用 `aigne observe` 指令。此工具會啟動一個本機網頁伺服器，提供一個使用者介面，用於檢查執行追蹤、呼叫詳細資訊和其他執行期資料。

1.  啟動觀察伺服器：

    ```bash 啟動 AIGNE 觀察器 icon=lucide:terminal
    aigne observe
    ```

    ![顯示可觀察性伺服器正在執行的終端機輸出](../../../examples/images/aigne-observe-execute.png)

2.  打開您的瀏覽器並導覽至提供的本機 URL（通常是 `http://localhost:7893`），以查看最近的 Agent 執行列表並檢查其追蹤。

    ![顯示追蹤列表的 Aigne 可觀察性網頁介面](../../../examples/images/aigne-observe-list.png)

## 總結

此範例展示了如何使用 AIGNE 框架實現具有持久性記憶體的聊天機器人。透過利用 `FSMemory` 外掛程式，聊天機器人可以記錄和檢索對話歷史及使用者個人資料資訊，從而實現更具情境感知和個人化的互動。

有關更進階的記憶體持久化選項，請參閱 [DID Spaces Memory](./examples-memory-did-spaces.md) 範例，該範例展示了如何使用去中心化儲存。

</content>