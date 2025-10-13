```d2
direction: down

Invocation: {
  label: "調用\n（使用者輸入、歷史記錄）"
  shape: oval
}

AIAgent: {
  label: "AIAgent 核心邏輯"
  shape: rectangle
  style: {
    stroke-width: 2
    stroke-dash: 4
  }

  PromptBuilder: {
    label: "1. 建構提示"
    shape: rectangle
  }

  Response-Handler: {
    label: "3. 處理回應"
    shape: diamond
  }

  Tool-Executor: {
    label: "4a. 執行工具"
    shape: rectangle
  }

  Output-Processor: {
    label: "4b. 處理最終答案\n（結構化資料提取）"
    shape: rectangle
  }
}

Language-Model: {
  label: "語言模型"
  shape: cylinder
}

Tools: {
  label: "可用工具"
  shape: rectangle
  Tool-A: "工具 A"
  Tool-B: "工具 B"
}

Final-Response: {
  label: "串流回應"
  shape: oval
}

Invocation -> AIAgent.PromptBuilder
AIAgent.PromptBuilder -> Language-Model: "2. 發送提示"
Language-Model -> AIAgent.Response-Handler: "LLM 原始輸出"
AIAgent.Response-Handler -> AIAgent.Tool-Executor: "工具呼叫"
AIAgent.Tool-Executor -> Tools
Tools -> AIAgent.PromptBuilder: "將工具結果返回至上下文" {
  style.stroke-dash: 2
}
AIAgent.Response-Handler -> AIAgent.Output-Processor: "最終答案"
AIAgent.Output-Processor -> Final-Response
```

## 建立 AIAgent

您可以使用 `AIAgent.from()` 工廠方法或直接使用建構函式來建立 `AIAgent` 執行個體。一個 Agent 至少需要 instructions 或 `inputKey` 才能運作。

以下是建立聊天 Agent 的基本範例：

```typescript
import { AIAgent } from "@core/agents/ai-agent";
import { GoogleChatModel } from "@core/models/google";

// 假設模型已在其他地方設定，例如在中央上下文中
const model = new GoogleChatModel({ model: "gemini-1.5-flash" });

const chatAgent = AIAgent.from({
  name: "chat-bot",
  description: "一個能回答問題的實用助理。",
  instructions: "你是一個實用的助理。你的目標是協助使用者找到他們需要的資訊並進行友善的對話。",
  inputKey: "message",
  model: model,
});

async function runChat() {
  const responseStream = await chatAgent.invoke({ message: "Hello, world!" });
  for await (const chunk of responseStream) {
    if (chunk.delta.text?.message) {
      process.stdout.write(chunk.delta.text.message);
    }
  }
}

runChat();
```

此範例建立了一個簡單的 Agent，它使用提供的指示來回應在 `message` 欄位中傳遞的使用者輸入。

## 設定選項 (`AIAgentOptions`)

`AIAgentOptions` 介面提供了廣泛的設定選項，以客製化 Agent 的行為。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="Agent 的唯一名稱。"></x-field>
  <x-field data-name="description" data-type="string" data-required="true" data-desc="對 Agent 目的和能力的描述。"></x-field>
  <x-field data-name="model" data-type="ChatModel" data-required="false" data-desc="Agent 將使用的語言模型執行個體。這也可以在調用時提供。"></x-field>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="false" data-desc="指導 AI 模型行為的指示。可以是一個簡單的字串，也可以是一個用於複雜模板的 `PromptBuilder` 執行個體。"></x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false" data-desc="指定輸入訊息中的哪個鍵應被視為主要使用者訊息。"></x-field>
  <x-field data-name="outputKey" data-type="string" data-default="message" data-desc="用於回應物件中文字輸出的自訂鍵。預設為 `message`。"></x-field>
  <x-field data-name="toolChoice" data-type="AIAgentToolChoice | Agent" data-default="auto" data-desc="控制 Agent 如何使用工具。詳情請參閱「工具使用」部分。"></x-field>
  <x-field data-name="keepTextInToolUses" data-type="boolean" data-required="false" data-desc="若為 true，模型在呼叫工具時生成的文字將保留在最終輸出中。"></x-field>
  <x-field data-name="catchToolsError" data-type="boolean" data-default="true" data-desc="若為 false，當工具執行失敗時，Agent 將會拋出錯誤。預設為 true，允許 Agent 處理錯誤。"></x-field>
  <x-field data-name="structuredStreamMode" data-type="boolean" data-default="false" data-desc="啟用一種模式，用於從模型的串流回應中提取結構化元資料（例如 JSON）。"></x-field>
  <x-field data-name="customStructuredStreamInstructions" data-type="object" data-required="false" data-desc="允許完全自訂結構化串流行為，包括提示指示和元資料解析邏輯。"></x-field>
  <x-field data-name="memoryAgentsAsTools" data-type="boolean" data-default="false" data-desc="當為 true 時，memory agents 將作為工具提供，模型可以呼叫這些工具來明確地檢索或儲存資訊。"></x-field>
</x-field-group>

## 工具使用

`AIAgent` 的一個關鍵功能是它能夠使用其他 Agent 作為工具。這使您能夠建構複雜的系統，其中一個 AI Agent 可以將任務委派給專門的 Agent 來執行操作。`toolChoice` 選項控制此行為。

### `AIAgentToolChoice` 列舉

-   **`auto` (預設)**：語言模型根據對話的上下文決定是否呼叫工具。這是最具彈性的選項。
-   **`none`**：停用 Agent 的所有工具使用，迫使其僅依賴自身知識。
-   **`required`**：強制 Agent 使用其中一個可用工具。模型必須進行工具呼叫。
-   **`router`**：一種特殊模式，其中 Agent 的唯一目的是選擇最合適的工具，並將使用者的輸入直接路由到該工具。`AIAgent` 本身不作回應；所選工具的輸出將成為最終回應。

### 範例：使用工具

```typescript
import { Agent } from "@core/agents/agent";
import { AIAgent, AIAgentToolChoice } from "@core/agents/ai-agent";

// 一個獲取天氣資訊的簡單工具 (一個 Agent)
const weatherTool = new Agent({
  name: "get_weather",
  description: "獲取特定地點的當前天氣。",
  inputSchema: {
    type: "object",
    properties: {
      location: { type: "string", description: "城市和州，例如：San Francisco, CA" },
    },
    required: ["location"],
  },
  async *process(input) {
    yield {
      delta: {
        json: {
          weather: `The weather in ${input.location} is sunny.`,
        },
      },
    };
  },
});

// 一個設定為使用此工具的 AIAgent
const weatherAssistant = AIAgent.from({
  name: "weather-assistant",
  description: "一個可以提供天氣預報的助理。",
  instructions: "你是一個天氣助理。使用可用的工具來回答有關天氣的問題。",
  tools: [weatherTool],
  toolChoice: AIAgentToolChoice.auto,
});

async function getWeather() {
  const responseStream = await weatherAssistant.invoke({
    message: "What's the weather like in New York?",
  });

  for await (const chunk of responseStream) {
    // 最終輸出將是工具結果的綜合
    console.log(chunk);
  }
}

getWeather();
```

## 結構化資料提取

`structuredStreamMode` 是一個強大的功能，適用於您需要從語言模型的回應中提取結構化資訊（如 JSON）以及純文字的場景。啟用後，Agent 會在模型的輸出中尋找特殊的元資料標籤，並解析其中的內容。

### 啟用結構化串流模式

要使用此功能，您必須：
1.  在 Agent 的選項中設定 `structuredStreamMode: true`。
2.  透過 `instructions` 提示，指示模型將其結構化輸出格式化到特定的標籤內（預設為 `<metadata>...</metadata>`）。

### 範例：提取 JSON

```typescript
import { AIAgent } from "@core/agents/ai-agent";

const sentimentAnalyzer = AIAgent.from({
  name: "sentiment-analyzer",
  description: "分析訊息的情感並提供評分。",
  instructions: `
    分析使用者訊息的情感。
    以簡短的解釋回應，然後在 <metadata> 標籤中提供結構化的情感分析。
    元資料應為一個 YAML 物件，包含 'sentiment'（positive、negative 或 neutral）和 'score'（0-1）欄位。
  `,
  structuredStreamMode: true,
});

async function analyzeSentiment() {
  const responseStream = await sentimentAnalyzer.invoke({
    message: "I am absolutely thrilled with the new update! It's fantastic.",
  });

  for await (const chunk of responseStream) {
    if (chunk.delta.text?.message) {
      // 串流回應的文字部分
      process.stdout.write(chunk.delta.text.message);
    }
    if (chunk.delta.json) {
      // 解析後的 JSON 物件將會出現在這裡
      console.log("\n[METADATA]:", chunk.delta.json);
    }
  }
}

// 預期輸出將會串流文字說明，
// 接著是解析後的 JSON 物件：
// [METADATA]: { sentiment: 'positive', score: 0.95 }

analyzeSentiment();
```

您可以使用 `customStructuredStreamInstructions` 選項進一步自訂元資料標籤和解析邏輯，以支援 YAML 以外的格式，例如 JSON。