---
labels: ["Reference"]
---

# Agents 與技能

在 AIGNE 生態系統中，Agents 和技能是為您的 AI 應用程式注入生命力的基本建構模組。它們協同運作，以建立由工具增強的複雜 AI 系統。您可以將 Agent 想像成負責推理和對話的大腦，而將技能視為其用來執行動作並與外部世界互動的工具。

本節將介紹這些核心元件的定義和結構。關於如何在您的專案中將它們結合起來的詳細資訊，請參閱 [專案設定 (aigne.yaml)](./core-concepts-project-configuration.md) 文件。

## Agents

Agent 是一個核心元件，負責處理使用者輸入、維護上下文，並決定要採取哪些動作。其行為由一組指令 (其核心提示) 和其可存取的技能集合所定義。

Agents 通常在 `.yaml` 檔案中定義。

### Agent 定義範例

這是一個配備了程式碼執行技能的聊天 Agent 的基本範例。

```yaml chat.yaml icon=mdi:robot-outline
name: chat
description: 聊天 Agent
instructions: |
  您是一個樂於助人的助理，可以回答問題並提供關於各種主題的資訊。
  您的目標是協助使用者找到他們需要的資訊，並進行友好的對話。
input_key: message
memory: true
skills:
  - sandbox.js
```

### Agent 屬性

Agent 的行為是透過其 YAML 定義檔案中的幾個關鍵屬性來設定的：

| 屬性 | 類型 | 描述 |
|---|---|---|
| `name` | `string` | Agent 的簡短描述性名稱。 |
| `description` | `string` | 對 Agent 用途的更詳細說明。 |
| `instructions` | `string` | 定義 Agent 個性、目標和限制的系統提示。這是其核心邏輯。 |
| `input_key` | `string` | 輸入物件中包含主要使用者訊息的屬性名稱 (例如 `message`)。 |
| `memory` | `boolean` | 若為 `true`，Agent 將保留對話歷史記錄，允許後續提問和上下文相關的互動。 |
| `skills` | `array` | Agent 被授權使用的技能檔案列表 (例如 `sandbox.js`)。 |

## 技能

技能是一個可執行的函式，通常以 JavaScript 編寫，為 Agent 提供特定能力。這可以是任何事，從執行程式碼、從 API 擷取資料，到與檔案系統互動。技能是大型語言模型的推理與具體任務執行之間的橋樑。

### 技能定義範例

技能是標準的 Node.js 模組，會匯出一個預設的非同步函式。關鍵的是，它們也會匯出描述其用途並定義其輸入/輸出結構的中繼資料，讓 Agent 能夠理解如何以及何時使用它們。

```javascript sandbox.js icon=logos:javascript
import vm from "node:vm";

export default async function evaluateJs({ code }) {
  const sandbox = {};
  const context = vm.createContext(sandbox);
  const result = vm.runInContext(code, context, { displayErrors: true });
  return { result };
}

evaluateJs.description = "此 Agent 評估 JavaScript 程式碼。";

evaluateJs.input_schema = {
  type: "object",
  properties: {
    code: { type: "string", description: "要評估的 JavaScript 程式碼" },
  },
  required: ["code"],
};

evaluateJs.output_schema = {
  type: "object",
  properties: {
    result: { type: "any", description: "評估後程式碼的結果" },
  },
  required: ["result"],
};
```

### 技能結構

一個技能檔案包含三個主要部分：

1.  **預設匯出的函式**：技能的核心邏輯。它是一個 `async` 函式，接收一個參數物件並回傳結果。
2.  **`description`**：附加到函式上的字串屬性，提供關於技能功能的自然語言描述。Agent 底層的 LLM 使用此描述來決定何時適合呼叫此技能。
3.  **`input_schema` / `output_schema`**：JSON Schema 物件，定義了函式輸入和輸出的預期結構和類型。這確保了 Agent 提供有效的參數，並能正確解釋結果。

## 它們如何協同運作

使用者、Agent 和技能之間的互動遵循一個清晰的模式。Agent 扮演著智慧協調者的角色，解讀使用者的請求，並呼叫適當的技能來完成它。

```d2
direction: down

User: {
  shape: c4-person
}

AIGNE-Runtime: {
  label: "AIGNE 執行環境"
  shape: rectangle

  Chat-Agent: {
    label: "聊天 Agent"
  }

  Sandbox-Skill: {
    label: "沙盒技能 (sandbox.js)"
  }
}

User -> AIGNE-Runtime.Chat-Agent: "1. 輸入：'5 + 7 是多少？'"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Chat-Agent: "2. LLM 推斷需要進行計算"
AIGNE-Runtime.Chat-Agent -> AIGNE-Runtime.Sandbox-Skill: "3. 呼叫技能並傳入 { code: '5 + 7' }"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Sandbox-Skill: "4. 在沙盒中執行程式碼"
AIGNE-Runtime.Sandbox-Skill -> AIGNE-Runtime.Chat-Agent: "5. 回傳 { result: 12 }"
AIGNE-Runtime.Chat-Agent -> User: "6. 形成回應：'結果是 12。'"
```

透過將推理 (Agent) 與執行 (技能) 分開，您可以建構出強大且可擴展、易於維護和升級的 AI 系統。

### 後續步驟

既然您已了解 Agents 和技能的核心概念，您可以繼續閱讀以下部分：

<x-cards>
  <x-card data-title="專案設定 (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    學習如何在主專案設定檔中設定 Agents、技能和模型。
  </x-card>
  <x-card data-title="建立自訂 Agent" data-icon="lucide:wand-sparkles" data-href="/guides/creating-a-custom-agent">
    遵循逐步指南，建立您自己的自訂 Agent 並將其整合為一項技能。
  </x-card>
</x-cards>