本文件詳細介紹 AIGNE 載入器系統，該系統負責載入和解析設定檔以建構和初始化 Agent。載入器是定義和設定 AI Agent 行為及其互動的主要進入點。

## 總覽

AIGNE 載入器系統旨在解讀一組設定檔（從根 `aigne.yaml` 檔案開始），以建立一個完整的執行環境。此過程涉及解析專案層級的設定、探索所有指定的 Agent 和技能，並將它們實例化為可執行的物件。載入器支援使用 YAML（為求簡潔）和 JavaScript/TypeScript（用於更複雜的程式化邏輯）來定義 Agent。

載入過程可視覺化如下：

```d2
direction: down

Config-Sources: {
  label: "設定來源"
  shape: rectangle

  aigne-yaml: "aigne.yaml\n(根進入點)"

  definitions: {
    label: "Agent 與技能定義"
    shape: rectangle
    grid-columns: 2

    yaml-files: "YAML 檔案\n(.yml)"
    ts-js-files: "TypeScript/JavaScript\n(.ts, .js)"
  }
}

Loader: {
  label: "AIGNE 載入器系統"
  shape: rectangle
}

Runtime: {
  label: "已初始化的執行環境"
  shape: rectangle

  Objects: {
    label: "記憶體中的活動物件"
    shape: rectangle
    grid-columns: 2

    Agent-Instances: "Agent 執行個體"
    Skill-Instances: "技能執行個體"
  }
}

Config-Sources.aigne-yaml -> Loader: "1. 讀取"
Config-Sources.definitions -> Loader: "2. 探索"
Loader -> Loader: "3. 解析與建構"
Loader -> Runtime.Objects: "4. 實例化"
```

## 核心功能

載入器系統由幾個關鍵函式協調，這些函式處理專案設定的探索、解析和實例化。

### `load` 函式

這是載入器系統的主要進入點。它接受您的專案目錄路徑（或特定的 `aigne.yaml` 檔案）和一個選項物件，然後回傳一個完全解析、可供使用的 `AIGNEOptions` 物件。

```typescript
// 來源：packages/core/src/loader/index.ts

export async function load(path: string, options: LoadOptions = {}): Promise<AIGNEOptions> {
  // ... implementation
}
```

### `loadAgent` 函式

此函式負責從檔案中載入單一 Agent。它會自動偵測檔案類型（YAML 或 JavaScript/TypeScript）並使用適當的解析器。

```typescript
// 來源：packages/core/src/loader/index.ts

export async function loadAgent(
  path: string,
  options?: LoadOptions,
  agentOptions?: AgentOptions,
): Promise<Agent> {
  // ... implementation
}
```

## 專案設定：`aigne.yaml`

`aigne.yaml`（或 `aigne.yml`）檔案是您專案設定的根。載入器會在提供的路徑中搜尋此檔案以開始載入過程。

### `aigne.yaml` 結構描述

以下是您可以在 `aigne.yaml` 檔案中定義的頂層屬性：

| Key | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | 您的專案名稱。 |
| `description` | `string` | 您的專案簡短描述。 |
| `model` | `string` or `object` | 所有 Agent 的預設聊天模型設定。可被個別 Agent 覆寫。 |
| `imageModel` | `string` or `object` | 所有 Agent 的預設圖片模型設定。 |
| `agents` | `string[]` | 要載入的 Agent 定義檔案的路徑列表。 |
| `skills` | `string[]` | 可全域使用的技能定義檔案的路徑列表。 |
| `mcpServer` | `object` | MCP (Multi-agent Communication Protocol) 伺服器的設定，包含要公開的 Agent 列表。 |
| `cli` | `object` | 命令列介面的設定，定義聊天 Agent 和 Agent 命令結構。 |

### `aigne.yaml` 範例

此範例展示了一個典型的專案設定，定義了預設模型，並列出了要載入的各種 Agent 和技能。

```yaml
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

## Agent 設定 (YAML)

Agent 是 AIGNE 平台的基礎建構區塊。您可以在 YAML 檔案中定義它們，以獲得一種宣告式且易於閱讀的格式。

### 通用 Agent 屬性

所有 Agent 類型都共用一組通用屬性：

| Key | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Agent 的唯一名稱。 |
| `description` | `string` | 描述 Agent 的目的與能力。 |
| `model` | `string` or `object` | 覆寫此特定 Agent 的預設聊天模型。 |
| `inputSchema` | `string` or `object` | 定義預期輸入的 JSON 結構描述檔案路徑或行內結構描述。 |
| `outputSchema` | `string` or `object` | 定義預期輸出的 JSON 結構描述檔案路徑或行內結構描述。 |
| `skills` | `(string or object)[]` | 此 Agent 可用的技能（工具）列表。可以是一個技能檔案的路徑或一個巢狀的 Agent 定義。 |
| `memory` | `boolean` or `object` | 為 Agent 啟用記憶體。可以是一個簡單的 `true` 或用於進階設定的物件。 |
| `hooks` | `object` or `object[]` | 定義在生命週期的不同點（例如 `onStart`、`onSuccess`）觸發其他 Agent 的掛鉤。 |

### Agent 類型

`type` 屬性決定了 Agent 的核心行為。

#### 1. AI Agent (`type: "ai"`)

最常見的類型，用於通用 AI 任務。它使用大型語言模型來處理指令並與技能互動。

-   **`instructions`**: 定義 Agent 的提示。可以是一個字串、一個包含 `role` 和 `content` 的物件，或使用 `url` 參考一個檔案。
-   **`inputKey`**: 輸入物件中應被視為主要使用者訊息的鍵。
-   **`toolChoice`**: 控制 Agent 如何使用工具（例如 `auto`、`required`）。

**範例：**

```yaml
name: chat-with-prompt
description: Chat agent
instructions:
  url: chat-prompt.md
input_key: message
memory: true
skills:
  - sandbox.js
```

#### 2. Image Agent (`type: "image"`)

專門用於根據提示生成圖片。

-   **`instructions`**: (必填) 用於生成圖片的提示。
-   **`modelOptions`**: 針對圖片生成模型的特定選項字典。

#### 3. Team Agent (`type: "team"`)

協調一組 Agent (技能) 共同完成一項任務。

-   **`mode`**: 處理模式，例如 `parallel` 或 `sequential`。
-   **`iterateOn`**: 使用技能處理時，從輸入中進行迭代的鍵。
-   **`reflection`**: 設定一個審查流程，由一個 `reviewer` Agent 批准或要求修改輸出。

#### 4. Transform Agent (`type: "transform"`)

使用 JSONata 表達式轉換輸入資料。

-   **`jsonata`**: (必填) 一個包含要應用於輸入的 JSONata 表達式的字串。

#### 5. MCP Agent (`type: "mcp"`)

作為外部 Agent 或服務的用戶端。

-   **`url`**: 外部 Agent 的 URL。
-   **`command`**: 要執行的 shell 命令。

#### 6. Function Agent (`type: "function"`)

在 JavaScript/TypeScript 檔案中以程式化方式定義。此類型在 JS/TS 檔案本身中指定，而不是在 YAML 中。