# 什麼是 AIGNE？

AIGNE（發音為 `[ˈei dʒən]`，類似 "agent" 去掉 "t" 的音）是一個用於開發 AI 應用程式的函式化框架。它旨在透過結合函式化程式設計、模組化設計和強大的人工智慧功能，來簡化和加速建構可擴展的現代應用程式的過程。

AIGNE 的核心概念是使用 **agents**——專門的 AI 助理——可以將它們組織成團隊，以自動化複雜、多步驟的任務。AIGNE 並不依賴單一、龐大的 AI，而是提供了一個建立數位勞動力的結構，讓不同的 agents 協同合作，每個 agent 處理一個更大問題的特定部分。

本文件以淺顯易懂的語言介紹 AIGNE 框架，解釋什麼是 AI agents、它們解決了什麼問題，以及它們如何協同工作以自動化複雜的工作流程。

## 什麼是 AI Agent？

AI Agent 是一種專門的數位助理，旨在執行特定功能。每個 agent 根據一組給定的指令運作，並可配備特定的工具來執行其任務。與通用聊天機器人不同，AIGNE agent 是某個狹窄領域的專家。

您可以將 agents 視為一個高效專案團隊中的個別成員：

*   **研究員：** 一個可以存取外部資訊來源以收集資料的 agent。
*   **寫手：** 一個可以處理原始資訊並起草結構化文件的 agent。
*   **程式設計師：** 一個能夠編寫和執行程式碼以執行技術功能的 agent。
*   **分析師：** 一個可以解讀資料、識別模式並提供洞見的 agent。

雖然單一 agent 對於簡單、明確的任務很有效，但 AIGNE 框架的主要優勢在於其能夠將多個 agents 組織成一個有凝聚力的團隊，以實現複雜的目標。

## AIGNE 解決的問題

單一大型語言模型 (LLM) 是執行回答問題或生成文本等任務的強大工具。然而，當面臨需要多個不同步驟、不同技能組合或來自多個來源的資訊的流程時，其能力就受到限制。

例如，像「分析我們最新的銷售報告，將其與公開的競爭對手表現數據進行比較，並為行銷團隊起草一份簡報」這樣的要求，對標準的聊天機器人來說會很有挑戰性。這個過程涉及幾個獨立的階段：

1.  **資料分析：** 閱讀和解讀內部銷售報告。
2.  **外部研究：** 尋找並提取競爭對手的表現數據。
3.  **綜合分析：** 比較這兩組數據集，以找出關鍵洞見。
4.  **內容創作：** 將研究結果組織成一份連貫的簡報。

AIGNE 透過提供一個框架來解決這個問題，將這樣複雜的請求分解為可管理的子任務。每個子任務隨後被分配給一個專門的 agent，而該框架則管理它們之間的資訊流，確保最終輸出完整且準確。

## Agents 如何協同工作以自動化任務

AIGNE 將 agents 組織成**工作流程**，這些是執行任務的結構化流程。透過連接 agents，您可以自動化那些原本需要大量手動協調的流程。該框架支援多種協作模式，從而實現靈活而強大的自動化。

下圖說明了 AIGNE 框架如何分解複雜任務並管理一個 agents 團隊以產生最終結果。

```d2
direction: down

Complex-Task: {
  label: "複雜、多步驟的任務"
  shape: oval
}

AIGNE: {
  label: "AIGNE 框架"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"
}

Decomposition: {
  label: "將任務分解為子任務"
  shape: rectangle
  style: {
    stroke-dash: 2
  }
}

Orchestration-Patterns: {
  label: "使用協作模式來調度 Agents"
  grid-columns: 3
  grid-gap: 50

  Sequential-Workflow: {
    label: "循序式 (流水線)"
    shape: rectangle
    direction: down
    Researcher: "Researcher Agent"
    Summarizer: "Summarizer Agent"
    Report-Writer: "Report Writer Agent"
  }

  Parallel-Workflow: {
    label: "平行式 (團隊合作)"
    shape: rectangle
    Task: "分析回饋"
    Agent-A: "處理正面回饋"
    Agent-B: "處理負面回饋"
  }

  Routing-Workflow: {
    label: "路由式 (管理者)"
    shape: rectangle
    Request: "傳入的請求"
    Manager: {
      label: "Manager Agent"
      shape: diamond
    }
    Coder: "Coder Agent"
    Writer: "Writer Agent"
  }
}

Final-Goal: {
  label: "連貫、完整的輸出"
  shape: oval
}

Complex-Task -> AIGNE: "輸入"
AIGNE -> Decomposition
Decomposition -> Orchestration-Patterns
Orchestration-Patterns -> Final-Goal: "輸出"
Orchestration-Patterns.Sequential-Workflow.Researcher -> Orchestration-Patterns.Sequential-Workflow.Summarizer -> Orchestration-Patterns.Sequential-Workflow.Report-Writer
Orchestration-Patterns.Parallel-Workflow.Task -> Orchestration-Patterns.Parallel-Workflow.Agent-A
Orchestration-Patterns.Parallel-Workflow.Task -> Orchestration-Patterns.Parallel-Workflow.Agent-B
Orchestration-Patterns.Routing-Workflow.Request -> Orchestration-Patterns.Routing-Workflow.Manager
Orchestration-Patterns.Routing-Workflow.Manager -> Orchestration-Patterns.Routing-Workflow.Coder: "路由"
Orchestration-Patterns.Routing-Workflow.Manager -> Orchestration-Patterns.Routing-Workflow.Writer: "路由"

```

常見的工作流程模式包括：

*   **循序式工作流程 (流水線)：** 一個 agent 完成其任務後，將結果直接傳遞給下一個 agent。這適用於有必要操作順序的流程，例如收集資料、進行摘要，然後起草報告。
*   **平行式工作流程 (團隊合作)：** 多個 agents 同時處理任務的不同部分以提高效率。例如，為了分析客戶回饋，一個 agent 可以處理正面評論，而另一個 agent 同時處理負面評論，最後再將結果匯總。
*   **路由式工作流程 (管理者)：** 一個「管理者」agent 分析傳入的請求，並決定哪個專家 agent 最適合處理它。這種模式對於建立能夠處理各種查詢的智慧助理或服務台非常有效。

透過結合這些工作流程模式，開發人員可以建構複雜的系統來自動化廣泛的數位流程。

## 總結

AIGNE 是一個用於建構和管理由專業 AI agents 組成的數位勞動力的框架。它提供了以下工具：

*   **分解**複雜問題為更小、定義明確的任務。
*   **分配**每個任務給具備合適技能的 AI agent。
*   **調度** agents 之間的協作，以達成最終、連貫的目標。

這種基於 agent 的方法克服了單一 AI 模型的限制，能夠以更高的可靠性和精確度自動化複雜的真實世界業務流程。

要了解更多關於 agents 在系統中可以扮演的不同角色，請繼續閱讀下一節。

*   **下一步：** [了解 Agents](./user-guide-understanding-agents.md)