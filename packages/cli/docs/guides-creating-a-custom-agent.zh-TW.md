---
labels: ["Reference"]
---

# 建立自訂 Agent

本指南提供逐步教學，說明如何建立一個新的 JavaScript agent，並將其作為技能整合到您的 AIGNE 專案中。Agent 是賦予您應用程式獨特功能的核心可執行元件。透過建立自訂 agent，您可以擴展 AI 的功能，以執行專門任務、與外部 API 互動或操作本機資料。

### 事前準備

在開始之前，請確保您已設定好 AIGNE 專案。如果還沒有，請先遵循我們的 [入門指南](./getting-started.md) 來建立一個。

### 步驟 1：建立技能檔案

在 AIGNE 中，技能是一個 JavaScript 模組，它會匯出一個主要函式和一些元資料。此函式包含您的 agent 將執行的邏輯。

讓我們來建立一個能產生問候語的簡單 agent。在 AIGNE 專案的根目錄中建立一個名為 `greeter.js` 的新檔案，並加入以下程式碼：

```javascript greeter.js icon=logos:javascript
export default async function greet({ name }) {
  const message = `Hello, ${name}!`;
  console.log(message);
  return { message };
}

greet.description = "一個回傳問候訊息的簡單 agent。";

greet.input_schema = {
  type: "object",
  properties: {
    name: { type: "string", description: "要包含在問候語中的名字。" },
  },
  required: ["name"],
};

greet.output_schema = {
  type: "object",
  properties: {
    message: { type: "string", description: "完整的問候訊息。" },
  },
  required: ["message"],
};
```

讓我們來解析這個檔案：

- **`export default async function greet({ name })`**：這是您 agent 的主要函式。它接受一個物件作為參數，該物件包含在 `input_schema` 中定義的輸入。它回傳的物件應符合 `output_schema`。
- **`greet.description`**：關於此 agent 功能的純文字描述。這點至關重要，因為主要語言模型會使用此描述來理解何時及如何使用您的工具。
- **`greet.input_schema`**：一個 JSON Schema 物件，定義您 agent 預期的輸入。這能確保傳遞給函式的資料是有效的。
- **`greet.output_schema`**：一個 JSON Schema 物件，定義您 agent 預期的輸出。

### 步驟 2：將技能整合至您的專案

現在您已經建立了技能，需要將其註冊到專案的設定檔中，以便主要的聊天 agent 能夠使用它。

1.  開啟您專案根目錄中的 `aigne.yaml` 檔案。
2.  將您的新檔案 `greeter.js` 加入到 `skills` 列表中。

```yaml aigne.yaml icon=mdi:file-cog-outline
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
skills:
  - sandbox.js
  - filesystem.yaml
  - greeter.js # 在此處加入您的新技能
```

透過將您的腳本加入此列表，您就使其成為一個工具，可供主要的聊天 agent 在對話中呼叫。

### 步驟 3：直接測試您的 Agent

技能建立並註冊後，就可以進行測試了。您可以使用 `aigne run` 直接從命令列執行任何技能檔案。

在您的終端機中執行以下指令：

```bash icon=mdi:console
aigne run ./greeter.js --input '{"name": "AIGNE Developer"}'
```

此指令會執行您的 `greeter.js` 腳本，並將 `--input` 旗標中的 JSON 字串作為參數傳遞給匯出的函式。您應該會看到以下輸出，確認您的 agent 運作正常：

```json icon=mdi:code-json
{
  "result": {
    "message": "Hello, AIGNE Developer!"
  }
}
```

### 步驟 4：在聊天模式中使用您的 Agent

當主要的 AI agent 能夠動態決定使用技能時，技能的真正威力才會被釋放。要實際體驗這一點，請在互動式聊天模式下執行您的專案：

```bash icon=mdi:console
aigne run --chat
```

聊天會話開始後，請 AI 使用您的新工具。例如：

```
> Use the greeter skill to say hello to the world.
```

AI 會辨識此請求，根據描述找到 `greeter` 技能，並使用正確的參數執行它。然後，它會使用您技能的輸出來組織其回應。

### 後續步驟

恭喜！您已成功建立一個自訂的 JavaScript agent，將其作為技能整合，並測試了其功能。現在，您可以建構更複雜的 agent 來連接 API、管理檔案或執行任何您可以用腳本編寫的任務。

若要了解如何與他人分享您的專案，請參閱我們的 [部署 Agent](./guides-deploying-agents.md) 指南。