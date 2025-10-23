# 使用 YAML 定義 Agent

AIGNE 框架支援使用 YAML 設定檔來定義 Agent 的聲明式方法。此方法將 Agent 的定義（其屬性、指令和技能）與應用程式的業務邏輯分開，從而促進了更好的組織性、可重用性，並使複雜的 Agent 系統更易於管理。

本指南全面概述了用於定義各種 Agent 類型及其屬性的 YAML 語法。

## 基本結構

每個 Agent 的定義，無論其類型為何，都包含在一個 `.yaml` 檔案中。`type` 屬性是決定 Agent 行為和所需屬性的主要區分符。如果省略 `type`，則預設為 `ai`。

以下是一個 AI Agent 設定的基本範例：

```yaml chat.yaml
name: Basic Chat Agent
description: A simple agent that responds to user messages.
type: ai
instructions: "You are a helpful assistant. Respond to the user's message concisely."
input_key: message
skills:
  - my-skill.js
```

### 核心屬性

以下屬性在大多數 Agent 類型中都很常見：

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="false">
    <x-field-desc markdown>Agent 的人類可讀名稱。</x-field-desc>
  </x-field>
  <x-field data-name="description" data-type="string" data-required="false">
    <x-field-desc markdown>關於 Agent 目的和能力的簡要描述。</x-field-desc>
  </x-field>
  <x-field data-name="type" data-type="string" data-required="false" data-default="ai">
    <x-field-desc markdown>指定 Agent 的類型。決定了必要的欄位和行為。有效類型包括 `ai`、`image`、`team`、`transform`、`mcp` 和 `function`。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="object | string" data-required="false">
    <x-field-desc markdown>Agent 使用的聊天模型設定，會覆寫任何全域定義的模型。可以是一個字串或一個詳細的物件。</x-field-desc>
  </x-field>
  <x-field data-name="skills" data-type="array" data-required="false">
    <x-field-desc markdown>此 Agent 可用作工具的其他 Agent 或 JavaScript/TypeScript 函數的清單。每個技能都透過其檔案路徑引用。</x-field-desc>
  </x-field>
  <x-field data-name="inputSchema" data-type="object | string" data-required="false">
    <x-field-desc markdown>定義預期輸入結構的 JSON 結構定義。可以是一個內聯物件或指向外部 `.json` 或 `.yaml` 檔案的路徑。</x-field-desc>
  </x-field>
  <x-field data-name="outputSchema" data-type="object | string" data-required="false">
    <x-field-desc markdown>用於建構 Agent 輸出的 JSON 結構定義。可以是一個內聯物件或指向外部檔案的路徑。這對於啟用結構化輸出至關重要。</x-field-desc>
  </x-field>
  <x-field data-name="memory" data-type="boolean | object" data-required="false">
    <x-field-desc markdown>為 Agent 啟用狀態性。設定為 `true` 可使用預設記憶體，或為特定提供者提供一個設定物件。</x-field-desc>
  </x-field>
  <x-field data-name="hooks" data-type="array" data-required="false">
    <x-field-desc markdown>定義生命週期掛鉤（`onStart`、`onSuccess`、`onError`、`onEnd`），這些掛鉤會在執行的不同階段觸發其他 Agent。</x-field-desc>
  </x-field>
</x-field-group>

## 載入外部提示和結構定義

為了維持乾淨和模組化的設定，您可以從外部檔案載入 Agent 指令和結構定義。這對於複雜的提示或可重用的資料結構特別有用。

### 外部指令

對於 `ai` 和 `image` Agent，指令可能會很長。您可以在一個單獨的 Markdown 或文字檔案中定義它們，並使用 `url` 鍵來引用它。

```yaml chat-with-prompt.yaml
name: chat-with-prompt
description: An AI agent with instructions loaded from an external file.
type: ai
instructions:
  url: prompts/main-prompt.md
input_key: message
memory: true
skills:
  - skills/sandbox.js
```

`main-prompt.md` 檔案包含將用作 Agent 系統提示的原始文字。

```markdown prompts/main-prompt.md
你是一位大師級的程式設計師。當使用者要求程式碼時，請提供一個完整、可執行的範例，並解釋關鍵部分。
```

您也可以建構一個具有不同角色的多部分提示：

```yaml multi-role-prompt.yaml
instructions:
  - role: system
    url: prompts/system-role.md
  - role: user
    content: "Here is an example of a good response:"
  - role: assistant
    url: prompts/example-response.md
```

### 外部結構定義

同樣地，`inputSchema` 和 `outputSchema` 可以引用定義結構定義結構的外部 JSON 或 YAML 檔案。

```yaml structured-output-agent.yaml
name: JSON Extractor
type: ai
instructions: Extract the user's name and email from the text.
outputSchema: schemas/user-schema.yaml
```

`user-schema.yaml` 檔案將包含 JSON 結構定義：

```yaml schemas/user-schema.yaml
type: object
properties:
  name:
    type: string
    description: The full name of the user.
  email:
    type: string
    description: The email address of the user.
required:
  - name
  - email
```

## 特定 Agent 類型

以下各節詳細介紹了每種 Agent 類型的獨特設定屬性。

### AI Agent (`type: ai`)

AIAgent 是最常見的類型，專為與語言模型進行通用互動而設計。

```yaml ai-agent-example.yaml
type: ai
name: Customer Support AI
instructions:
  url: prompts/support-prompt.md
input_key: customer_query
output_key: response
# 強制模型呼叫特定技能
tool_choice: "sandbox"
outputSchema: schemas/support-response.yaml
skills:
  - sandbox.js
```

<x-field-group>
  <x-field data-name="instructions" data-type="string | object | array" data-required="false">
    <x-field-desc markdown>給 AI 模型的系統提示或指令。可以是一個簡單的字串、對外部檔案的引用 (`url`)，或是一個訊息物件的陣列 (`role`, `content`/`url`)。</x-field-desc>
  </x-field>
  <x-field data-name="inputKey" data-type="string" data-required="false">
    <x-field-desc markdown>輸入物件中包含要傳送給模型的主要使用者訊息的鍵。</x-field-desc>
  </x-field>
  <x-field data-name="outputKey" data-type="string" data-required="false">
    <x-field-desc markdown>AI 的最終文字回應將放置在輸出物件中的這個鍵之下。</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="string" data-required="false">
    <x-field-desc markdown>強制模型使用特定技能（工具）。該值必須與附加到 Agent 的技能名稱相符。</x-field-desc>
  </x-field>
</x-field-group>

### Team Agent (`type: team`)

TeamAgent 會調度一組子 Agent（在 `skills` 下定義）來執行多步驟任務。

```yaml team-agent-example.yaml
type: team
name: Research and Write Team
# Agent 將依序執行
mode: sequential
# 此團隊的輸出將是所有步驟的彙總輸出
include_all_steps_output: true
skills:
  - url: agents/researcher.yaml
  - url: agents/writer.yaml
  - url: agents/editor.yaml
```

<x-field-group>
  <x-field data-name="mode" data-type="string" data-required="false" data-default="sequential">
    <x-field-desc markdown>團隊的執行模式。可以是 `sequential`（Agent 依序執行）或 `parallel`（Agent 並行執行）。</x-field-desc>
  </x-field>
  <x-field data-name="iterateOn" data-type="string" data-required="false">
    <x-field-desc markdown>輸入物件中包含陣列的鍵。團隊將對陣列中的每個項目執行其工作流程。</x-field-desc>
  </x-field>
  <x-field data-name="reflection" data-type="object" data-required="false">
    <x-field-desc markdown>設定一個自我修正循環，其中一個 `reviewer` Agent 會檢查輸出，並可以觸發重新執行，直到輸出被批准為止。</x-field-desc>
  </x-field>
</x-field-group>

### Image Agent (`type: image`)

ImageAgent 專門用於使用圖像模型生成圖像。

```yaml image-agent-example.yaml
type: image
name: Logo Generator
instructions: "A minimalist, flat-design logo for a tech startup named 'Innovate'."
# 將特定選項傳遞給圖像模型提供者
model_options:
  quality: hd
  style: vivid
```

<x-field-group>
  <x-field data-name="instructions" data-type="string | object" data-required="true">
    <x-field-desc markdown>描述所需圖像的提示。與 AI Agent 不同，這是一個必填欄位。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用於控制圖像生成的提供者特定選項的鍵值對映表（例如 `quality`、`style`、`size`）。</x-field-desc>
  </x-field>
</x-field-group>

### Transform Agent (`type: transform`)

TransformAgent 使用 [JSONata](https://jsonata.org/) 表示式，以聲明方式對映、篩選或重組 JSON 資料，而無需編寫程式碼。

```yaml transform-agent-example.yaml
type: transform
name: User Formatter
description: Extracts and formats user names from a list.
jsonata: "payload.users.{'name': firstName & ' ' & lastName}"
```

<x-field-group>
  <x-field data-name="jsonata" data-type="string" data-required="true">
    <x-field-desc markdown>要對輸入資料執行的 JSONata 表示式。</x-field-desc>
  </x-field>
</x-field-group>

## 總結

透過 YAML 定義 Agent 提供了一種強大、聲明式的替代方案，以取代程式化定義。它實現了清晰的關注點分離，增強了可重用性，並簡化了 Agent 設定的管理。透過利用外部檔案來處理提示和結構定義，您可以建構複雜、模組化且可維護的 AI 系統。

如需更多動手實作範例，請參閱 [進階主題](./developer-guide-advanced-topics.md) 部分的其他指南。