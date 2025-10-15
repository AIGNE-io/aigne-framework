# 基礎 Agent

您可以將基礎 Agent 想像成一個專業的數位助理，就像一個樂於助人的聊天機器人或一個專注的資料輸入員。每個 Agent 都被設計用來執行一種特定類型的任務並將其完美完成。它根據一組明確的指令運作，接收特定的輸入進行處理，並產生結果。

這些單一用途的 Agent 是 AIGNE 的基本建構模塊。雖然它們本身很簡單，但可以組合起來處理更複雜的工作流程，我們將在 [Agent 團隊](./user-guide-understanding-agents-agent-teams.md) 一節中探討這一點。

## Agent 的結構

每個基礎 Agent，無論其功能為何，都由幾個核心組件定義。了解這些部分有助於闡明 Agent 如何知道該做什麼。

<x-cards data-columns="2">
  <x-card data-title="指令" data-icon="lucide:book-marked">
    這是 Agent 的永久規則手冊或工作說明。它是一份詳細的指南，告訴 Agent 它的身份、目的以及應如何行事。例如，客戶服務 Agent 的指令可能是：「你是一位友善且樂於助人的助理。你的目標是準確地回答客戶問題。」
  </x-card>
  <x-card data-title="輸入" data-icon="lucide:arrow-right-to-line">
    這是在特定時刻您給予 Agent 的特定資訊或任務。如果該 Agent 是一個聊天機器人，輸入就是使用者的問題，例如「你們的營業時間是什麼？」。
  </x-card>
  <x-card data-title="輸出" data-icon="lucide:arrow-left-from-line">
    這是 Agent 根據其指令處理輸入後產生的結果。對於聊天機器人的例子，輸出就是答案：「我們的營業時間是週一至週五，上午 9 點到下午 5 點。」
  </x-card>
  <x-card data-title="技能" data-icon="lucide:sparkles">
    這些是 Agent 可用於執行其任務的特殊工具或能力。例如，一個「天氣 Agent」可能擁有一項技能，使其能夠從外部服務存取即時天氣資料。
  </x-card>
</x-cards>

## Agent 如何運作

這個過程很直接。使用者向 Agent 提供一個輸入。Agent 接著會查閱其核心指令以了解情境和規則，在必要時使用它可能具備的任何技能，並產生一個輸出。

```d2 icon=material-symbols:robot-2-outline
direction: right

User: {
  label: "使用者"
  shape: person
}

Agent: {
  label: "基礎 Agent"
  shape: hexagon
  style.fill: "#f0f4f8"
}

Instructions: {
  label: "核心指令\n（規則手冊）"
  shape: document
}

Output: {
  label: "結果"
  shape: document
}

User -> Agent: "輸入（例如，一個具體問題）"
Agent -> Instructions: "查閱"
Instructions -> Agent: "提供指導"
Agent -> Output: "產生輸出（例如，一個答案）"
```

## 範例：一個簡單的聊天 Agent

讓我們來看一個「聊天 Agent」的實際範例。這個 Agent 被設計成一個樂於助人、能回答問題的助理。其設定看起來會像這樣：

| 屬性 | 值 | 說明 |
| :--- | :--- | :--- |
| **名稱** | `chat` | Agent 的一個簡單識別碼。 |
| **說明** | `Chat agent` | 對其用途的簡要說明。 |
| **指令**| `你是一個樂於助人的助理...` | 這告訴 Agent 要友善且提供豐富資訊。 |
| **輸入鍵** | `message` | Agent 預期使用者的問題會被標記為 "message"。 |
| **輸出鍵** | `message` | Agent 會將其答案標記為 "message"。 |

當您向這個 Agent 發送像 `message: 「一個 Agent 是如何運作的？」` 這樣的輸入時，它會遵循其樂於助人的指令，並根據其程式設計提供一個清晰、資訊豐富的答案。

## 總結

一個基礎 Agent 是一個單一任務的數位工作者，由其指令、接收的輸入和產生的輸出來定義。它們是 AIGNE 的必要基礎組件。雖然在執行特定任務時很強大，但它們的真正潛力是在被組合成 [Agent 團隊](./user-guide-understanding-agents-agent-teams.md) 以應對更複雜的挑戰時才會被釋放。