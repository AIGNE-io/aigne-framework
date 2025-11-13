# 工作流協作 (Workflow Orchestration)

本文件提供了一份技術演練，說明如何透過協調多個專業化 AI Agent 來建構一個複雜的處理管線。透過本範例，您將學習如何建構一個工作流，其中由一個協作者 Agent 將任務（如研究、撰寫和事實查核）指派給一組協同工作的 Agent，共同完成一個複雜的目標。

## 概覽

在此範例中，我們建立了一個多 Agent 系統，旨在對特定主題進行深入研究，並編寫一份詳細報告。此工作流由一個 `OrchestratorAgent` 管理，它會引導一組專業化的 Agent 並行執行特定的子任務。

資訊流如下：

1.  初始請求被傳送至 `Orchestrator` Agent。
2.  `Orchestrator` 將請求分解為多個任務，並分派給專業化的 Agent，如 `Finder`、`Writer`、`Proofreader`、`Fact Checker` 和 `Style Enforcer`。
3.  這些 Agent 會同時執行各自的任務。例如，`Finder` 使用網頁抓取工具收集資訊，而 `Writer` 則開始建構報告的結構。
4.  所有 Agent 的輸出都會傳送至 `Synthesizer` Agent。
5.  `Synthesizer` 整合所有資訊，並產生最終的綜合報告。

此工作流可以透過下圖視覺化呈現：```d2
direction: down

Request: {
  label: "初始請求"
  shape: oval
}

Orchestrator: {
  label: "Orchestrator Agent"
  shape: rectangle
}

Specialized-Agents: {
  label: "專業化 Agent (並行執行)"
  shape: rectangle
  grid-columns: 3
  style: {
    stroke-dash: 2
  }

  Finder: {
    shape: rectangle
  }

  Writer: {
    shape: rectangle
  }

  Proofreader: {
    shape: rectangle
  }

  Fact-Checker: {
    label: "Fact Checker"
    shape: rectangle
  }

  Style-Enforcer: {
    label: "Style Enforcer"
    shape: rectangle
  }
}

Synthesizer: {
  label: "Synthesizer Agent"
  shape: rectangle
}

Report: {
  label: "最終報告"
  shape: oval
}

Request -> Orchestrator: "1. 傳送請求"
Orchestrator -> Specialized-Agents: "2. 分派任務"
Specialized-Agents -> Synthesizer: "4. 傳送輸出"
Synthesizer -> Report: "5. 產生最終報告"
```

## 前提條件

在執行此範例之前，請確保滿足以下要求：

*   **Node.js**：必須安裝 20.0 或更高版本。
*   **OpenAI API 金鑰**：Agent 需要 API 金鑰才能與語言模型互動。請從 [OpenAI API 金鑰頁面](https://platform.openai.com/api-keys)取得。

## 快速入門

您無需手動安裝，即可使用 `npx` 直接從命令列執行此範例。

### 執行範例

此腳本可以在預設的單次執行模式或互動式聊天模式下執行。

```bash 以單次執行模式執行 icon=lucide:terminal
npx -y @aigne/example-workflow-orchestrator
```

```bash 以互動式聊天模式執行 icon=lucide:terminal
npx -y @aigne/example-workflow-orchestrator --chat
```

您也可以透過標準管線直接提供輸入：

```bash 使用管線輸入 icon=lucide:terminal
echo "Research ArcBlock and compile a report about their products and architecture" | npx -y @aigne/example-workflow-orchestrator
```

### 連接至 AI 模型

首次執行時，腳本會提示您連接至一個 AI 模型提供商。

![連接至模型提供商](./run-example.png)

有三種連接選項：

1.  **AIGNE Hub (官方)**：這是建議選項。您的瀏覽器將開啟官方的 AIGNE Hub，供您登入並連接。新使用者將獲得免費的 token 贈額。
2.  **AIGNE Hub (自行託管)**：若您自行託管 AIGNE Hub 實例，請選擇此選項並輸入其 URL 以建立連接。
3.  **第三方模型提供商**：您可以透過設定相應的環境變數及您的 API 金鑰，直接連接至 OpenAI 等提供商。

例如，若要使用 OpenAI，請設定 `OPENAI_API_KEY` 環境變數：

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

設定模型後，再次執行執行指令。

## 從原始碼安裝

對於希望修改或檢視原始碼的開發者，請依照以下步驟從本地儲存庫執行範例。

### 1. 複製儲存庫

```bash 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴套件

前往範例目錄並使用 `pnpm` 安裝所需的套件。

```bash 安裝依賴套件 icon=lucide:terminal
cd aigne-framework/examples/workflow-orchestrator
pnpm install
```

### 3. 執行範例

使用 `pnpm start` 指令從原始碼目錄執行腳本。

```bash 以單次執行模式執行 icon=lucide:terminal
pnpm start
```

若要以互動式聊天模式執行，請加上 `--chat` 旗標。額外的 `--` 是必要的，以便將參數傳遞給 `pnpm` 腳本執行器。

```bash 以互動式聊天模式執行 icon=lucide:terminal
pnpm start -- --chat
```

## 程式碼實作

以下 TypeScript 程式碼展示了如何定義和協作這組 Agent。它初始化了兩個專業化 Agent——`finder` 和 `writer`——並使用一個 `OrchestratorAgent` 來管理它們的執行。

`finder` Agent 具備 `puppeteer` 和 `filesystem` 技能，使其能夠瀏覽網頁並儲存資訊。`writer` Agent 負責編寫最終報告並將其寫入檔案系統。

```typescript orchestrator-workflow.ts icon=logos:typescript
import { OrchestratorAgent } from "@aigne/agent-library/orchestrator/index.js";
import { AIAgent, AIGNE, MCPAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
  modelOptions: {
    parallelToolCalls: false, // puppeteer 一次只能執行一個任務
  },
});

const puppeteer = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  env: process.env as Record<string, string>,
});

const filesystem = await MCPAgent.from({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", import.meta.dir],
});

const finder = AIAgent.from({
  name: "finder",
  description: "Find the closest match to a user's request",
  instructions: `您是一個可以在網路上尋找資訊的 Agent。
您的任務是找到與使用者請求最相符的內容。
您可以使用 puppeteer 來抓取網路上的資訊。
您也可以使用 filesystem 來儲存您找到的資訊。

規則：
- 不要使用 puppeteer 的螢幕截圖
- 使用 document.body.innerText 來取得頁面的文字內容
- 如果您想要某個頁面的 URL，您應該取得當前（首頁）頁面的所有連結及其標題，
然後您可以使用標題來搜尋您想訪問的頁面的 URL。
  `,
  skills: [puppeteer, filesystem],
});

const writer = AIAgent.from({
  name: "writer",
  description: "Write to the filesystem",
  instructions: `您是一個可以寫入檔案系統的 Agent。
  您的任務是接收使用者的輸入，處理它，並將結果寫入到磁碟的適當位置。`,
  skills: [filesystem],
});

const agent = OrchestratorAgent.from({
  skills: [finder, writer],
  maxIterations: 3,
  tasksConcurrency: 1, // puppeteer 一次只能執行一個任務
});

const aigne = new AIGNE({ model });

const result = await aigne.invoke(
  agent,
  `\
僅使用官方網站對 ArcBlock 進行深入研究\
（避免使用搜尋引擎或第三方來源），並編寫一份詳細報告，儲存為 arcblock.md。\
報告應包含對公司產品（附有詳細的研究發現和連結）、技術架構和未來計畫的全面見解。`,
);
console.log(result);
```

當被調用時，`AIGNE` 實例會將提示傳遞給 `OrchestratorAgent`，後者會協調 `finder` 和 `writer` Agent，根據提供的指令產生最終報告。

## 命令列選項

此腳本接受多個命令列參數，以自訂其行為和模型的生成參數。

| 參數 | 說明 | 預設值 |
| :--- | :--- | :--- |
| `--chat` | 以互動式聊天模式執行。 | 停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型。格式為 'provider\[:model]'。例如：'openai' 或 'openai:gpt-4o-mini'。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度值。 | 提供商預設值 |
| `--top-p <value>` | 設定 top-p 取樣值。 | 提供商預設值 |
| `--presence-penalty <value>` | 設定存在懲罰值。 | 提供商預設值 |
| `--frequency-penalty <value>` | 設定頻率懲罰值。 | 提供商預設值 |
| `--log-level <level>` | 設定日誌詳細程度。可接受 `ERROR`、`WARN`、`INFO`、`DEBUG` 或 `TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接以命令列參數指定輸入。 | 無 |

### 使用範例

```bash 設定日誌級別 icon=lucide:terminal
pnpm start -- --log-level DEBUG
```

## 偵錯

若要監控和分析 Agent 的執行情況，請使用 `aigne observe` 指令。此指令會啟動一個本地網頁伺服器，提供一個使用者友善的介面來檢查追蹤、查看詳細的呼叫資訊，並了解 Agent 的執行期行為。

首先，在您的終端機中啟動觀察伺服器：
![啟動 aigne observe](../images/aigne-observe-execute.png)

該介面提供最近執行的列表。您可以選擇一個執行來深入查看其詳細的追蹤資訊。
![查看執行列表](../images/aigne-observe-list.png)

此工具對於偵錯、效能調校以及深入了解 Agent 如何處理資訊並與模型和工具互動至關重要。

## 總結

本範例展示了 `OrchestratorAgent` 在協調多個專業化 Agent 以解決複雜問題方面的功能。透過將一個大任務分解為多個較小、可管理的子任務，並將它們分配給具備相應技能的 Agent，您可以建構出穩健且可擴展的 AI 驅動工作流。

若要探索其他工作流模式，請參考以下範例：
<x-cards data-columns="2">
  <x-card data-title="循序工作流" data-href="/examples/workflow-sequential" data-icon="lucide:arrow-right">建構具有保證執行順序的逐步處理管線。</x-card>
  <x-card data-title="並行工作流" data-href="/examples/workflow-concurrency" data-icon="lucide:git-compare-arrows">透過同時處理多個任務來最佳化效能。</x-card>
</x-cards>