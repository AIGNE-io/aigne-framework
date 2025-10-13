本指南全面概述了 AIGNE 框架，旨在讓開發者在 30 分鐘內上手並開始運作。我們將涵蓋核心概念、專案結構，以及設定和執行您的第一個 AI Agent 的基本步驟。

### 核心概念

AIGNE 是一個強大的框架，用於建構、組合和執行 AI Agent。它使用宣告式方法，透過 YAML 檔案來定義專案結構和個別 Agent 的行為。

*   **專案：** 一個 AIGNE 專案由一個 `aigne.yaml` 檔案定義，該檔案作為中央清單，指定 Agent、技能和預設組態。
*   **Agent：** Agent 是最基本的建構單元。它是一個可以執行任務、使用工具並與其他 Agent 互動的實體。AIGNE 支援多種類型的 Agent，包括 `ai`、`team`、`function` 等。
*   **技能：** 技能是一種可重複使用的工具或函式，可以附加到 Agent 上，賦予其特定能力。

### 專案結構

該框架圍繞 `aigne.yaml` 檔案為中心。此檔案協調您專案中的所有不同元件。

```yaml
# aigne.yaml - 主要專案組態

name: test_aigne_project
description: A test project for the aigne agent
chat_model:
  name: gpt-4o-mini
  temperature: 0.8
agents:
  - chat.yaml
  - chat-with-prompt.yaml
  - team.yaml
skills:
  - sandbox.js
cli:
  agents:
    - chat.yaml
    - url: test-cli-agents/a.yaml
      name: a-renamed
```

#### 主要組態區塊

*   **`name` 和 `description`**：專案的基本元資料。
*   **`chat_model`**：為專案中所有 Agent 定義預設的語言模型及其設定（例如 `temperature`）。這可以在個別 Agent 的組態中被覆寫。
*   **`agents`**：YAML 或 JS 檔案的列表，每個檔案定義一個 Agent。
*   **`skills`**：定義可重複使用技能的檔案列表。這些通常是匯出函式的 JavaScript 檔案。
*   **`cli`**：設定哪些 Agent 在命令列介面中作為指令公開，使其可以直接從終端機執行。

### 載入流程

當您執行一個 AIGNE 專案時，框架會執行以下步驟來載入和初始化您的 Agent：

1.  **尋找 `aigne.yaml`**：它會在指定的目錄中搜尋 `aigne.yaml` 或 `aigne.yml` 檔案。
2.  **解析組態**：解析主要的 `aigne.yaml` 檔案以取得專案設定以及 Agent 和技能的列表。
3.  **載入 Agent 和技能**：框架會遍歷在 `agents` 和 `skills` 區塊中定義的路徑。它會讀取每個檔案，並根據其副檔名（`.yaml` 或 `.js`）解析 Agent/技能的定義。
4.  **建構 Agent**：使用解析後的定義，它會建構 Agent 實例，將它們與其指定的模型、技能和任何其他組態連結起來。
5.  **公開 Agent**：最後，它會根據 `aigne.yaml` 中的定義，透過像 `cli` 或 `mcp_server` 這樣的介面讓 Agent 可用。

這種載入機制非常靈活，讓您可以用簡單、可重複使用的部分來組合複雜的 Agent 行為。此流程的核心邏輯可以在 `packages/core/src/loader/index.ts` 中找到。

```d2
direction: down

Developer: {
  shape: c4-person
}

Project-Files: {
  label: "專案組態"
  style.stroke-dash: 2
  shape: rectangle

  aigne-yaml: {
    label: "aigne.yaml\n(專案清單)"
    shape: rectangle
  }

  Agent-Definitions: {
    label: "Agent 定義"
    shape: rectangle
    agent1: "chat.yaml"
    agent2: "team.yaml"
  }

  Skill-Definitions: {
    label: "技能定義"
    shape: rectangle
    skill1: "sandbox.js"
  }
}

AIGNE-Loader: {
  label: "AIGNE 核心載入器"
  shape: rectangle
}

Constructed-Agents: {
  label: "已建構的 Agent 實例\n(在記憶體中)"
  shape: rectangle
}

Execution-Interfaces: {
  label: "執行介面"
  style.stroke-dash: 2
  shape: rectangle
  CLI
  MCP-Server
}


AIGNE-Loader -> Project-Files.aigne-yaml: "1. 尋找並解析清單"
Project-Files.aigne-yaml -> Project-Files.Agent-Definitions: "參考" {
  style.stroke-dash: 2
}
Project-Files.aigne-yaml -> Project-Files.Skill-Definitions: "參考" {
  style.stroke-dash: 2
}
AIGNE-Loader -> Project-Files.Agent-Definitions: "2. 載入定義"
AIGNE-Loader -> Project-Files.Skill-Definitions: "2. 載入定義"
AIGNE-Loader -> Constructed-Agents: "3. 建構 Agent 並連結技能"
Constructed-Agents -> Execution-Interfaces: "4. 公開 Agent"
Developer -> Execution-Interfaces.CLI: "透過指令執行 Agent"
```

### 定義 Agent

Agent 通常在它們自己的 YAML 檔案中定義。`type` 屬性決定了 Agent 的核心行為。

#### Agent 類型

AIGNE 支援多種 Agent 類型，每種類型都有不同的用途：

*   **`ai`**：最常見的類型。一種使用語言模型處理指令並生成回應的 AI Agent。它可以使用技能（工具）來執行動作。
*   **`image`**：專門根據提示生成圖像的 Agent。
*   **`team`**：一種強大的 Agent，可協調一組其他 Agent 來完成複雜的任務。
*   **`mcp`**：一種可以執行 shell 指令或連接到遠端 MCP 伺服器的 Agent。
*   **`transform`**：一種使用 JSONata 表達式轉換輸入資料的 Agent。
*   **`function`**：一種執行 JavaScript 函式的 Agent。

#### AI Agent 範例

以下是在 `chat.yaml` 中定義的一個基本 `ai` Agent 範例：

```yaml
# chat.yaml

type: ai
name: "Chat Agent"
description: "A simple conversational agent."

# 為 AI 模型定義提示和上下文
instructions:
  - role: system
    content: "You are a helpful assistant."
  - role: user
    content: "Hi, I need help with my task."

# 覆寫 aigne.yaml 中的預設模型
model:
  name: gpt-4
  temperature: 0.7

# 為 Agent 附加技能
skills:
  - "sandbox.js"
```

*   **`type: ai`**：指定這是一個 AI Agent。如果省略，則預設為 `ai`。
*   **`instructions`**：為語言模型提供上下文和提示。它可以是一個簡單的字串，或是一個包含 `role` 和 `content` 的訊息物件列表。您也可以使用 `url` 從外部檔案載入指令。
*   **`model`**：允許您為此特定 Agent 指定不同的模型或設定，覆寫專案層級的預設值。
*   **`skills`**：Agent 可以用作工具的技能檔案列表。

### 快速入門：您的第一個「Greeter」Agent

讓我們建立一個簡單的專案，看看所有功能如何運作。

#### 步驟 1：建立專案檔案

首先，在一個新目錄中建立一個名為 `aigne.yaml` 的檔案。

```yaml
# aigne.yaml
name: "Greeter Project"
description: "A simple project to demonstrate AIGNE."

# 定義屬於此專案的 Agent
agents:
  - "greeter.yaml"

# 讓 'greeter' Agent 可從命令列執行
cli:
  agents:
    - "greeter.yaml"
```

#### 步驟 2：建立 Agent 定義

接下來，在同一個目錄中建立 Agent 檔案 `greeter.yaml`。

```yaml
# greeter.yaml
name: "Greeter"
description: "A friendly agent that greets the user."

# 給 AI 的指令
instructions: "You are a friendly agent. Greet the user based on their name."

# 定義此 Agent 預期的輸入
inputSchema:
  type: object
  properties:
    name:
      type: string
      description: "The name of the person to greet."
  required:
  - name
```

*   **`instructions`**：我們給予 Agent 一個簡單的角色和目標。
*   **`inputSchema`**：我們定義此 Agent 需要一個 `name` 作為輸入。如果未提供，AIGNE 將自動提示使用者輸入。

#### 步驟 3：執行 Agent

現在，您可以使用 AIGNE CLI 從終端機執行您的 Agent。

```bash
aigne run greeter --name "World"
```

**預期輸出：**

```
> Hello, World! It's a pleasure to meet you.
```

您也可以在不提供名稱的情況下執行它，它會提示您輸入：

```bash
aigne run greeter
```

**預期互動：**

```
? What is the name of the person to greet? › World
> Hello, World! It's a pleasure to meet you.
```

### 接下來呢？

恭喜！您已成功建立並執行了您的第一個 AIGNE Agent。接下來，您可以探索更進階的主題：

*   **建立技能**：透過編寫自訂的 JavaScript 函式，賦予您的 Agent 新的能力。
*   **建立團隊**：協調多個 Agent 來解決複雜、多步驟的問題。
*   **使用記憶體**：為您的 Agent 提供長期記憶，以回憶過去的互動。