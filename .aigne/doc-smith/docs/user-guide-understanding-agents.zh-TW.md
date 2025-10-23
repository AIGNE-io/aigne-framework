# 瞭解 Agent

在 AIGNE 框架中，「agent」是完成工作的基本建構模組。您可以將 agent 想像成一位專業的數位工作者，受僱來執行特定任務。每個 agent 都有明確的角色和一套技能。就像在現實世界的團隊中，您可以將單一任務指派給一個 agent，或組建一個 agent 團隊來處理更複雜的專案。

其核心原則是將一個大問題分解成更小、更易於管理的任務，並將每個任務指派給最適合該工作的 agent。這種方法有助於提高清晰度、效率，並能夠建構複雜的自動化工作流程。

本節提供了 agent 可扮演的不同角色的概念性概述。如需更詳細的說明，請參閱以下頁面：

-   **[基礎 Agent](./user-guide-understanding-agents-basic-agents.md):** 瞭解作為獨立工作者的單一 agent。
-   **[Agent 團隊](./user-guide-understanding-agents-agent-teams.md):** 探索多個 agent 如何協作解決複雜問題。

```d2
direction: down
style: {
  font-size: 14
  stroke: "#262626"
  fill: "#FAFAFA"
  stroke-width: 2
  border-radius: 8
}

Your_Request -> Manager_Agent

subgraph "Specialist Agents" {
    direction: right
    Researcher
    Artist
    Calculator
}

Manager_Agent -> Researcher: "指派研究任務"
Manager_Agent -> Artist: "指派圖像創建"
Manager_Agent -> Calculator: "指派計算任務"

Researcher -> Manager_Agent: "回傳研究結果"
Artist -> Manager_Agent: "回傳圖像"
Calculator -> Manager_Agent: "回傳結果"

Manager_Agent -> Completed_Task

Your_Request: {
  label: "您的請求\n（例如：『建立一份帶有圖表的銷售趨勢報告』）"
  shape: document
  style: {
    fill: "#E0F2FE"
    stroke: "#0EA5E9"
  }
}

Manager_Agent: {
  label: "管理員 Agent\n（團隊 Agent）"
  tooltip: "協調工作流程並委派任務"
  style: {
    fill: "#FEF3C7"
    stroke: "#FBBF24"
  }
}

Researcher: {
  label: "研究員\n（AI Agent）"
  tooltip: "分析資料並總結趨勢"
  style: {
    fill: "#D1FAE5"
    stroke: "#10B981"
  }
}

Artist: {
  label: "藝術家\n（圖像 Agent）"
  tooltip: "根據資料生成圖表"
  style: {
    fill: "#D1FAE5"
    stroke: "#10B981"
  }
}

Calculator: {
  label: "計算機\n（函式 Agent）"
  tooltip: "執行特定計算"
  style: {
    fill: "#D1FAE5"
    stroke: "#10B981"
  }
}

Completed_Task: {
  label: "已完成的任務\n（最終報告）"
  shape: document
  style: {
    fill: "#E0F2FE"
    stroke: "#0EA5E9"
  }
}
```

### Agent 可扮演的角色

為了更深入地瞭解其功能，我們可以使用類比來描述常見的 agent 類型及其在系統中扮演的角色。

<x-cards data-columns="2">
  <x-card data-title="專家" data-icon="lucide:user-cog">
    這是最常見的 agent 類型，通常由 AI 模型驅動。它就像您為特定認知任務（例如作家、翻譯員或分析師）聘請的專家。您給予它指令和一則資訊，它會根據其專業知識產出結果。例如，您可以要求它總結一篇長文或草擬一封專業的電子郵件。
  </x-card>
  <x-card data-title="專案經理" data-icon="lucide:users">
    這種 agent 本身不執行任務，但擅長協調其他 agent。就像現實中的專案經理一樣，它會接受一個複雜的目標，將其分解為更小的步驟，並將這些步驟委派給適當的專家 agent。它確保工作按正確的順序進行，並確保最終結果被正確地組合起來。
  </x-card>
  <x-card data-title="工具使用者" data-icon="lucide:wrench">
    有些 agent 專門用於操作特定工具。這可能是一個用於執行數學運算的計算機、一個搜尋資料庫的工具，或是一個連接到外部服務（如天氣 API）的工具。這些 agent 可靠且可預測，每次被呼叫時都會執行精確的功能。
  </x-card>
  <x-card data-title="資料處理員" data-icon="lucide:file-cog">
    這種 agent 專門從事資訊的格式化和重組。它可以將一種結構的資料轉換為另一種結構。例如，它可以從客戶的電子郵件中提取特定詳細資訊，並將其格式化為結構化記錄存入資料庫，就像文書人員將紙本表格上的資訊轉錄到試算表中一樣。
  </x-card>
</x-cards>

### 總結

透過將 agent 理解為具有專業角色的數位工作者，您就可以開始瞭解如何將它們組合起來以自動化複雜的流程。單一的 agent 可以是執行特定任務的強大工具，但 AIGNE 框架的真正潛力在於組建一個 agent 團隊，其中每個 agent 貢獻其獨特的技能以實現共同目標。

若要深入瞭解這些概念如何付諸實踐，請繼續閱讀接下來的章節。

-   **[基礎 Agent](./user-guide-understanding-agents-basic-agents.md):** 探索單一 agent 如何運作。
-   **[Agent 團隊](./user-guide-understanding-agents-agent-teams.md):** 瞭解如何為複雜的工作流程協調多個 agent。