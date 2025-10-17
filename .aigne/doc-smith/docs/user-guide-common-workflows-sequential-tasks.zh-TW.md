# 循序任務

循序任務工作流程會按照特定、預定的順序處理一系列任務。其運作方式如同數位裝配線，前一個步驟的輸出會成為下一個步驟的輸入。這種模式非常適合多階段流程，其中每個步驟都建立在前一個步驟的基礎之上。

在 AIGNE 框架中，這是由設定為循序模式（`sequential` mode）運作的 `TeamAgent` 來管理。團隊中的每個 Agent 都會先完成其任務，然後再將結果傳遞下去，以確保從開始到結束的進程合乎邏輯且井然有序。

```d2
direction: down

Initial-Request: {
  label: "初始請求"
  shape: oval
}

TeamAgent: {
  label: "TeamAgent (循序模式)"
  shape: rectangle
  style: {
    stroke-dash: 2
  }

  Agent-1: {
    label: "Agent 1"
    shape: rectangle
  }

  Agent-2: {
    label: "Agent 2"
    shape: rectangle
  }

  Final-Agent: {
    label: "最終 Agent"
    shape: rectangle
  }
}

Final-Result: {
  label: "最終結果"
  shape: oval
}

Initial-Request -> TeamAgent.Agent-1: "1. 初始輸入"
TeamAgent.Agent-1 -> TeamAgent.Agent-2: "2. 輸出 1 + 初始輸入"
TeamAgent.Agent-2 -> TeamAgent.Final-Agent: "3. 輸出 2 + 先前輸入"
TeamAgent.Final-Agent -> Final-Result: "4. 最終輸出"

```

## 運作方式

想像一個請求進入工作流程。

1.  序列中的第一個 Agent 接收初始輸入並進行處理。
2.  完成後，其輸出會與原始輸入相結合。
3.  這個結合後的結果接著會被傳遞給序列中的第二個 Agent。
4.  這個交接過程會沿著序列持續進行，直到最終的 Agent 完成其任務。
5.  最後一個 Agent 的輸出即為整個工作流程的最終結果。

這確保了每個 Agent 都擁有所有先前 Agent 已完成工作的完整脈絡，從而能夠建立複雜且精密的管線。

## 常見使用案例

對於需要結構化、逐步執行的任務，循序工作流程非常有效。

-   **內容生成管線**：由一個初始 Agent 進行主題的腦力激盪，第二個 Agent 撰寫草稿，第三個 Agent 進行校對，最後一個 Agent 將其格式化以供發布。
-   **資料處理 (ETL)**：一個 Agent 從來源提取資料，另一個 Agent 將其轉換為標準化格式，第三個 Agent 將其載入資料庫。
-   **客戶查詢升級**：一個前線 Agent 回答基本的客戶問題。如果問題複雜，它會將對話歷史記錄傳遞給專門的技術支援 Agent 進行解決。
-   **報告生成**：一個 Agent 收集原始資料，第二個 Agent 進行分析並產生關鍵見解，第三個 Agent 將研究結果彙編成一份格式化的報告。

## 總結

循序任務工作流程提供了一種可靠且結構化的方式來自動化複雜的多步驟流程。透過將多個 Agent 串聯起來，您可以建立強大且一致的自動化管線，其中操作順序對於達成預期結果至關重要。

對於可以同時執行的任務，可以考慮使用[平行任務](./user-guide-common-workflows-parallel-tasks.md)工作流程以提高效率。