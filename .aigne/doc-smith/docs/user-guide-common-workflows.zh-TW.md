# 常見工作流程

在 AIGNE 框架中，單一 Agent 可以執行特定任務。然而，當多個 Agent 協作解決更複雜的問題時，才能真正發揮系統的強大威力。就像團隊成員一樣，Agent 可以被組織起來以結構化的方式協同工作。這些協作模式被稱為「工作流程」。

工作流程定義了任務和資訊如何在不同的 Agent 之間流動以實現更大的目標。透過以不同的模式安排 Agent，我們可以為各種業務需求建立精密的自動化流程。

下圖說明了三種基本的工作流程模式。

```d2
direction: down

Sequential-Tasks: {
  label: "循序任務"
  shape: rectangle
  Agent-A: { label: "Agent A" }
  Agent-B: { label: "Agent B" }
  Agent-C: { label: "Agent C" }
}

Parallel-Tasks: {
  label: "平行任務"
  shape: rectangle
  Initial-Task: { label: "初始任務" }
  Parallel-Agents: {
    shape: rectangle
    grid-columns: 3
    Agent-A: { label: "Agent A" }
    Agent-B: { label: "Agent B" }
    Agent-C: { label: "Agent C" }
  }
  Combined-Result: { label: "合併結果" }
}

Decision-Making: {
  label: "決策制定"
  shape: rectangle
  Request: { label: "請求" }
  Manager-Agent: {
    label: "管理者 Agent"
    shape: diamond
  }
  Specialized-Agents: {
    shape: rectangle
    grid-columns: 2
    Agent-A: { label: "專業 Agent A" }
    Agent-B: { label: "專業 Agent B" }
  }
}

Sequential-Tasks.Agent-A -> Sequential-Tasks.Agent-B: "結果"
Sequential-Tasks.Agent-B -> Sequential-Tasks.Agent-C: "結果"

Parallel-Tasks.Initial-Task -> Parallel-Tasks.Parallel-Agents.Agent-A
Parallel-Tasks.Initial-Task -> Parallel-Tasks.Parallel-Agents.Agent-B
Parallel-Tasks.Initial-Task -> Parallel-Tasks.Parallel-Agents.Agent-C

Parallel-Tasks.Parallel-Agents.Agent-A -> Parallel-Tasks.Combined-Result
Parallel-Tasks.Parallel-Agents.Agent-B -> Parallel-Tasks.Combined-Result
Parallel-Tasks.Parallel-Agents.Agent-C -> Parallel-Tasks.Combined-Result

Decision-Making.Request -> Decision-Making.Manager-Agent
Decision-Making.Manager-Agent -> Decision-Making.Specialized-Agents.Agent-A: "任務 A"
Decision-Making.Manager-Agent -> Decision-Making.Specialized-Agents.Agent-B: "任務 B"
```

本指南介紹了您將遇到的最常見的工作流程。了解這些模式將幫助您視覺化 Agent 如何為您自動化複雜的多步驟流程。

探索每個工作流程的詳細說明，以深入了解其具體使用案例和優點。

<x-cards data-columns="3">
  <x-card data-title="循序任務" data-icon="lucide:list-ordered" data-href="/user-guide/common-workflows/sequential-tasks">
    如同生產線，Agent 一個接一個地完成任務，並將其工作成果傳遞給下一個 Agent。這對於必須按特定順序執行的流程來說非常理想。
  </x-card>
  <x-card data-title="平行任務" data-icon="lucide:git-fork" data-href="/user-guide/common-workflows/parallel-tasks">
    為了更快完成工作，多個 Agent 可以同時處理一個任務的不同部分。然後將它們各自的結果合併起來，形成一個完整的解決方案。
  </x-card>
  <x-card data-title="決策制定" data-icon="lucide:git-merge" data-href="/user-guide/common-workflows/decision-making">
    就像一位經理，一個 Agent 可以分析傳入的請求，並智慧地將其路由到最適合的專業 Agent 來處理該項工作。
  </x-card>
</x-cards>

透過結合這些基本模式，您可以根據自己的特定需求建立強大且自主的系統。點擊任何卡片以深入了解每個工作流程的運作方式。