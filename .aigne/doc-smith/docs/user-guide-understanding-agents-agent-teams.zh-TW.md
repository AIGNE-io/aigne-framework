# Agent 團隊

雖然單一、專業的 Agent 對於特定任務很有用，但有些問題對於單一 Agent 來說過於龐大或複雜，無法獨自處理。就像在人類組織中一樣，當一項任務需要多個步驟或多樣化的技能時，您會組建一個團隊。在 AIGNE 中，Agent 團隊是一群被組織起來協作解決更大目標的 Agent。

可以這樣想：如果一個 [基本 Agent](./user-guide-understanding-agents-basic-agents.md) 就像一位平面設計師這樣的專家，那麼一個 Agent 團隊就是整個行銷部門，包括文案撰寫員、策略師和設計師，他們共同為一個行銷活動而努力。

## Agent 團隊如何協作

根據任務的性質，Agent 團隊可以被設定以不同的方式協同工作。兩種主要的協作模式是循序式和平行式。

### 循序式工作流程：裝配線

在循序式工作流程中，Agent 按照特定順序一個接一個地執行任務。第一個 Agent 的輸出成為第二個 Agent 的輸入，依此類推，就像一條裝配線。這種方法非常適合每個步驟都依賴於前一步驟完成的流程。

例如，要撰寫一篇部落格文章，一個團隊可能會這樣工作：
1.  **研究員 Agent：** 蒐集有關主題的資訊和關鍵事實。
2.  **撰寫員 Agent：** 根據研究結果撰寫部落格文章草稿。
3.  **編輯員 Agent：** 審查草稿的文法和風格，並提供最終版本。

### 平行式工作流程：腦力激盪會議

在平行式工作流程中，團隊中的所有 Agent 會同時處理相同的初始輸入。每個 Agent 獨立執行其專業任務，然後將它們各自的輸出結合起來，形成最終結果。這類似於一場腦力激盪會議，不同的專家同時對一個問題貢獻他們獨特的觀點。

例如，要分析市場情緒，一個團隊可以平行工作：
*   **輸入：** 一家公司的名稱。
*   **社群媒體 Agent：** 掃描 Twitter 上的提及。
*   **新聞 Agent：** 搜尋最近的新聞文章。
*   **金融 Agent：** 查詢近期的股票表現。
*   **輸出：** 將所有三份報告合併成一份單一、全面的市場分析。

### 反思：品質保證循環

一個更進階的模式是「反思」，它引入了一個品質控制步驟。在這個模型中，團隊完成其任務，然後由一個特殊的 **審查員 Agent** 檢查輸出。

*   如果工作成果符合要求的標準，審查員會批准它，流程就完成了。
*   如果工作成果不令人滿意，審查員會提供回饋並將其送回團隊再次嘗試。

這個循環會一直持續，直到輸出被批准或達到最大嘗試次數為止。它透過將審查和改進的循環直接建構到工作流程中，來確保更高品質的結果。

下圖說明了這三種主要的協作模式。

```d2
direction: down

Sequential-Workflow: {
  label: "循序式工作流程：裝配線"
  style.stroke-dash: 2

  Input: { shape: oval }
  Researcher: "研究員 Agent"
  Writer: "撰寫員 Agent"
  Editor: "編輯員 Agent"
  Output: { label: "最終版本"; shape: oval }

  Input -> Researcher: "主題"
  Researcher -> Writer: "研究成果"
  Writer -> Editor: "草稿"
  Editor -> Output: "批准的文章"
}

Parallel-Workflow: {
  label: "平行式工作流程：腦力激盪會議"
  style.stroke-dash: 2

  Input: { label: "公司名稱"; shape: oval }
  Social-Media: "社群媒體 Agent"
  News: "新聞 Agent"
  Financial: "金融 Agent"
  Output: { label: "綜合市場分析"; shape: oval }

  Input -> Social-Media
  Input -> News
  Input -> Financial
  Social-Media -> Output: "提及"
  News -> Output: "文章"
  Financial -> Output: "股票數據"
}

Reflection-Workflow: {
  label: "反思：品質保證循環"
  style.stroke-dash: 2

  Team: "Agent 團隊"
  Task-Output: "任務輸出"
  Reviewer: {
    label: "審查員 Agent"
    shape: diamond
  }
  Final-Output: { label: "最終批准的輸出"; shape: oval }

  Team -> Task-Output
  Task-Output -> Reviewer
  Reviewer -> Final-Output: "已批准"
  Reviewer -> Team: "需要修訂\n（回饋）"
}
```

## 總結

透過將 Agent 組織成團隊，您可以自動化更複雜、多步驟的工作流程。這種協作方法能夠建立複雜的解決方案，以模擬真實世界的業務流程，從內容創作流程到數據分析和品質保證檢查。

要了解這些概念的實際應用，請探索我們的 [常見工作流程](./user-guide-common-workflows.md) 指南，其中提供了 Agent 團隊解決實際問題的實用範例。有關實作的技術細節，開發者可以參考 [團隊 Agent 文件](./developer-guide-agents-team-agent.md)。