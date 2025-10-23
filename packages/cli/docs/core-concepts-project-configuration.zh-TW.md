---
labels: ["Reference"]
---

# 專案設定 (aigne.yaml)

`aigne.yaml` 檔案是您 AIGNE 專案的核心。它作為中央清單，定義了專案的元資料、語言模型設定，以及其核心組件（如 agents 和技能）之間的關係。一個結構良好的 `aigne.yaml` 是建立一個強大且有組織的 agent 的第一步。

此檔案使用 YAML 格式，其設計旨在方便人類閱讀與編寫。

## 核心設定鍵

讓我們來分解一個典型的 `aigne.yaml` 檔案中的主要區段。

### 專案元資料

這些欄位提供您專案的基本資訊。

<x-field data-name="name" data-type="string" data-required="true" data-desc="專案的唯一識別碼。"></x-field>
<x-field data-name="description" data-type="string" data-required="false" data-desc="簡要描述您的專案功能。"></x-field>

```yaml aigne.yaml icon=mdi:file-document
name: test_aigne_project
description: A test project for the aigne agent
```

### 聊天模型 (`chat_model`)

這是一個關鍵區段，您可以在此設定將驅動您 agents 的大型語言模型 (LLM)。AIGNE 提供了一種靈活的方式來定義模型提供者、名稱和其他參數。

| 鍵 | 類型 | 描述 |
|---|---|---|
| `provider` | string | LLM 提供者（例如 `openai`）。也可以在 `model` 鍵中以前綴形式指定。 |
| `name` / `model` | string | 要使用的具體模型（例如 `gpt-4o-mini`）。 |
| `temperature` | number | 一個介於 0 和 2 之間的值，用來控制模型輸出的隨機性。值越高，回應越具創造性。 |

以下是幾種常見的模型設定方式：

**範例 1：使用 `provider` 和 `name`**

這是一種清晰、明確的模型定義方式。

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  provider: openai
  name: gpt-4o-mini
  temperature: 0.8
```

**範例 2：使用帶前綴的 `model` 鍵**

這是一種更簡潔的縮寫格式。

```yaml aigne.yaml icon=mdi:file-document
chat_model:
  model: openai:gpt-4o-mini
  temperature: 0.8
```

### Agents (`agents`)

`agents` 鍵列出了您專案中包含的所有 agent 定義檔 (`.yaml`)。這裡列出的每個檔案都為特定的 agent 定義了行為、提示和工具使用方式。

```yaml aigne.yaml icon=mdi:file-document
# ... 其他設定
agents:
  - chat.yaml
```

### 技能 (`skills`)

`skills` 鍵列出了為您的 agents 提供工具和能力的可執行程式碼或定義。這些可以是包含函式的 JavaScript 檔案 (`.js`) 或定義複雜技能的其他 YAML 檔案。

```yaml aigne.yaml icon=mdi:file-document
# ... 其他設定
skills:
  - sandbox.js
  - filesystem.yaml
```

### 服務與 CLI 暴露

您也可以設定您的 agents 如何對外暴露，無論是透過伺服器還是作為命令列工具。

- `mcp_server`：設定當您執行 `aigne serve-mcp` 命令時，哪些 agents 會透過模型內容協定 (MCP) 提供服務。
- `cli`：設定哪些 agents 可以直接從命令列執行。

```yaml aigne.yaml icon=mdi:file-document
# ... 其他設定
mcp_server:
  agents:
    - chat.yaml

cli:
  agents:
    - chat.yaml
```

## 完整範例

以下是一個完整的 `aigne.yaml` 檔案，它將所有這些元素整合在一起：

```yaml aigne.yaml icon=mdi:file-document
name: test_aigne_project
description: A test project for the aigne agent

chat_model:
  model: openai:gpt-4o-mini
  temperature: 0.8

agents:
  - chat.yaml

skills:
  - sandbox.js

mcp_server:
  agents:
    - chat.yaml

cli:
  agents:
    - chat.yaml
```

有了這個設定檔，您的專案就有了一個堅實的基礎。下一步是定義您的 agents 和技能的實際功能。

---

現在您已經了解如何設定專案，讓我們更詳細地探索核心組件。請繼續下一節以了解 [Agents 與技能](./core-concepts-agents-and-skills.md)。
