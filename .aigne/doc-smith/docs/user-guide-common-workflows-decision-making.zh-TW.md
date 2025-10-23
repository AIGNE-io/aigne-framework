# 決策制定

說明一個「管理員」Agent 分析請求，並決定哪個專業 Agent 最適合處理該任務的情境。

## 概覽

在許多真實世界的場景中，單一的 AI Agent 是不夠的。複雜的問題通常需要一個由專業 Agent 組成的團隊，每個 Agent 都是特定領域的專家。決策制定工作流程，也稱為路由器（Router）或分流（Triage）模式，透過引入一個「管理員」Agent 來解決這個問題。

管理員 Agent 的唯一職責是分析傳入的請求，理解其意圖，並將其路由到團隊中最合適的專業 Agent。這就像一位客服調度員，聆聽客戶的問題，然後將他們轉接到正確的部門——無論是技術支援、帳務還是銷售部門。

這種模式創建了一個更高效、更智能的系統。不再是由一個通才型的 Agent 嘗試處理所有事情，而是擁有一個協調合作的團隊，其中每個成員都在其指定的任務上表現出色。

## 運作方式

此工作流程始於使用者提交一個請求。管理員 Agent 作為中央路由器，接收這個請求。根據其指令和可用的「工具」（即專業 Agent），它會決定哪個專業 Agent 最有能力處理該查詢。然後，請求會被交給選定的專業 Agent，由其處理並產生最終輸出。

例如，如果使用者問：「我的訂單狀態是什麼？」，管理員 Agent 會將查詢路由到「訂單狀態」Agent。如果使用者問：「我該如何重設密碼？」，查詢將被路由到「帳戶支援」Agent。

```d2
direction: down

User: {
  shape: c4-person
}

Manager-Agent: {
  label: "管理員 Agent\n（路由器）"
  shape: rectangle
}

Specialist-Agents: {
  label: "專業 Agent 團隊"
  shape: rectangle
  style: {
    stroke-dash: 4
  }
  grid-columns: 3

  Order-Status: { label: "訂單狀態 Agent" }
  Account-Support: { label: "帳戶支援 Agent" }
  Technical-Support: { label: "技術支援 Agent" }
}

User -> Manager-Agent: "1. 提交請求"
Manager-Agent -> Specialist-Agents.Order-Status: "2. 根據意圖路由\n（例如：'訂單狀態'）"
Manager-Agent -> Specialist-Agents.Account-Support: "2. 根據意圖路由\n（例如：'重設密碼'）"
Manager-Agent -> Specialist-Agents.Technical-Support: "2. 根據意圖路由\n（例如：'技術問題'）"

Specialist-Agents.Order-Status -> User: "3. 處理並返回輸出"
Specialist-Agents.Account-Support -> User: "3. 處理並返回輸出"
Specialist-Agents.Technical-Support -> User: "3. 處理並返回輸出"
```

## 使用案例

此工作流程對於以下情境非常有效：

- **智慧客服支援：** 自動將客戶查詢路由到正確的部門（例如：技術支援、帳務、銷售）。
- **多功能助理：** 創建一個單一助理，可以將排程、數據分析或內容創作等任務委派給不同的專業 Agent。
- **內容審核：** 對傳入的內容進行分類，並根據其性質（例如：垃圾郵件、仇恨言論、不當內容）將其發送到不同的審核佇列。
- **複雜查詢處理：** 將複雜的查詢分解為子任務，並將每個子任務路由到特定的 Agent 進行處理。

## 總結

決策制定工作流程是一個強大的模式，用於協調一個由專業 AI Agent 組成的團隊。透過使用管理員 Agent 來分流和路由任務，您可以建立更精密、可擴展且高效的 AI 應用程式，充分利用各個專注 Agent 的優勢。

若要了解更多關於技術實現的資訊，請參閱 [Team Agent](./developer-guide-agents-team-agent.md) 和 [AI Agent](./developer-guide-agents-ai-agent.md) 的文件。