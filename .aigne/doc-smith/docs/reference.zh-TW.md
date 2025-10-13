我已經產生了一張圖表，以提供 AIGNE 框架架構的概覽。現在，我將繼續產生「AIGNE 核心概念」部分的詳細文件。

# AIGNE 核心概念

歡迎來到 AIGNE 框架的核心概念。本文件為開發者提供了構成 AIGNE 架構的基本建構模組的概覽。理解這些概念對於使用 AIGNE 建構穩健且智慧的應用程式至關重要。

該框架圍繞模組化和可擴展的架構設計，讓開發者能夠為各種任務建立、組合和管理複雜的 AI Agent。此架構的核心是幾個關鍵組件：**Agents**、**模型**、**技能**和**記憶體**，所有這些都透過一個中央的 **AIGNE 專案** 設定進行協調。

```d2
direction: down

AIGNE-Project: {
  label: "AIGNE 專案\n（協調與設定）"
  icon: "https://www.arcblock.io/image-bin/uploads/89a24f04c34eca94f26c9dd30aec44fc.png"

  Agent: {
    label: "Agent"
    shape: rectangle
  }

  Models: {
    label: "模型"
    shape: rectangle
  }

  Skills: {
    label: "技能"
    shape: rectangle
  }

  Memory: {
    label: "記憶體"
    shape: cylinder
  }
}

AIGNE-Project.Agent -> AIGNE-Project.Models: "使用"
AIGNE-Project.Agent -> AIGNE-Project.Skills: "執行"
AIGNE-Project.Agent -> AIGNE-Project.Memory: "存取"
```

## AIGNE 專案

一個 AIGNE 專案是您 AI 應用程式的頂層容器。它由一個 `aigne.yaml` 檔案定義，該檔案作為設定和協調的中心樞紐。您可以在此檔案中定義並連接所有其他核心組件。

**`aigne.yaml` 的主要職責：**

*   **專案定義**：設定專案的名稱和描述。
*   **模型設定**：指定預設的聊天模型以及 Agent 要使用的其他模型。
*   **Agent 組成**：列出專案中包含的所有 Agent。
*   **技能註冊**：註冊可供 Agent 使用的技能（工具）。
*   **服務整合**：設定與 MCP（訊息控制協定）伺服器等服務的連接。
*   **CLI 設定**：定義如何透過命令列介面公開專案的 Agent。

### 範例：`aigne.yaml`

以下是一個典型的 `aigne.yaml` 檔案範例，說明了這些組件如何結合在一起：

```yaml
# 來源：packages/core/test-agents/aigne.yaml
name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
  - chat-with-prompt.yaml
  - team.yaml
  - image.yaml
  - agents/test-relative-prompt-paths.yaml
skills:
  - sandbox.js
mcp_server:
  agents:
    - chat.yaml
cli:
  agents:
    - chat.yaml
    - test-cli-agents/b.yaml
    - url: test-cli-agents/a.yaml
      name: a-renamed
      description: A agent from a.yaml
      alias: ["a", "a-agent"]
      agents:
        - url: test-cli-agents/a-1.yaml
          agents:
            - url: test-cli-agents/a-1-1.yaml
            - url: test-cli-agents/a-1-2.yaml
              name: a12-renamed
              description: A agent from a-1-2.yaml
        - test-cli-agents/a-2.yaml
```

## Agents

Agent 是 AIGNE 框架中的主要執行者。它們是專門設計用來執行任務、與使用者互動以及與其他 Agent 協作的實體。每個 Agent 都有其特定目的，並且可以配備自己的模型、技能和記憶體。

該框架提供了幾種類型的 Agent，每種類型都有不同的角色：

*   **`AIAgent`**：最基礎的 Agent，設計用來與 AI 模型互動。它能理解使用者輸入，使用 AI 模型處理，並產生回應。它也可以配備技能（工具）來執行特定操作。
*   **`ChatModel`**：一個專門的 Agent，直接與基於聊天的語言模型（例如 GPT-4、Claude）介接。
*   **`TeamAgent`**：一個協調者 Agent，管理一組其他的 Agent。它可以根據輸入將任務委派給其團隊中最適合的 Agent，從而實現複雜的多步驟工作流程。
*   **`UserAgent`**：在系統中代表人類使用者，負責擷取並轉發使用者輸入給其他 Agent。
*   **`ImageAgent`**：一個專門處理與影像相關任務的 Agent，與影像生成或分析模型介接。
*   **`GuideRailAgent`**：作為一個驗證層，確保另一個 Agent 的輸出符合預定義的綱要或規則集。
*   **`TransformAgent`**：一個實用工具 Agent，負責處理資料並將其從一種格式轉換為另一種格式。
*   **`MCPAgent`**：促進與訊息控制協定（MCP）伺服器的通訊，讓 Agent 能與更廣泛的服務和 Agent 網路互動。

這些 Agent 被設計為可組合的，讓您可以透過將它們以各種設定組合來建構複雜的系統。

## 模型

模型是為 Agent 提供智慧的引擎。AIGNE 被設計為模型無關（model-agnostic），支援來自不同供應商的各種語言和影像模型。這讓您可以為您的特定任務和預算選擇最佳模型。

一個 Agent 使用模型來理解語言、產生回應、分析資料或建立影像。您可以在 `aigne.yaml` 的專案層級設定預設模型，也可以為個別 Agent 指定特定模型以進行更精細的控制。

該框架包含了許多熱門模型供應商的適配器，例如：
*   OpenAI（GPT 系列）
*   Anthropic（Claude 系列）
*   Google（Gemini 系列）
*   Amazon Bedrock
*   等等...

## 技能

技能是可重複使用的工具或函式，可將 Agent 的能力擴展到簡單的聊天之外。它們類似於其他 AI 框架中的「工具」。透過賦予 Agent 技能，您可以使其能夠與外部系統互動、存取資料庫、呼叫 API 或執行複雜的計算。

技能通常被定義為 JavaScript 或 TypeScript 函式，並在 `aigne.yaml` 檔案中註冊。當一個 `AIAgent` 配備了技能，底層的語言模型可以智慧地決定何時使用技能來滿足使用者的請求。

例如，您可以建立技能來：
*   從天氣 API 獲取目前天氣。
*   從 CRM 檢索客戶資訊。
*   執行資料庫查詢。
*   執行檔案系統操作。

## 記憶體

記憶體讓 Agent 能夠在多次互動中持續保存資訊並維持上下文。這對於創造有狀態的對話體驗至關重要，在這種體驗中，Agent 可以記住對話的過去部分並從中學習。

AIGNE 支援不同的記憶體系統，讓您可以設定對話歷史和其他資料的儲存方式和位置。這可以從用於短期上下文的簡單記憶體內儲存，到用於長期記憶體的更持久的資料庫解決方案。

透過利用記憶體，您的 Agent 可以：
*   記住使用者偏好。
*   追蹤對話歷史以提供相關的回應。
*   從先前的互動中學習以改善未來的表現。

## 這一切如何協同運作

1.  一位使用者與應用程式互動，輸入由 **UserAgent** 擷取。
2.  輸入被路由到一個適當的 Agent，例如 **AIAgent** 或 **TeamAgent**。
3.  Agent 使用其設定的**模型**來處理輸入並決定下一步。
4.  如果需要，Agent 會執行其一個或多個**技能**來收集資訊或執行操作。
5.  在此過程中，Agent 會讀取和寫入其**記憶體**以維持上下文。
6.  最後，Agent 產生一個回應並將其傳回給使用者。

這整個工作流程在 **AIGNE 專案** (`aigne.yaml`) 中定義和設定，提供了一種清晰且集中的方式來管理您的 AI 應用程式。