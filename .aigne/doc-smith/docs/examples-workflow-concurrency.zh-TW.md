# 工作流程並行

您是否希望加快您的 AI 工作流程？本指南將示範如何使用 AIGNE 框架建構一個並行工作流程，讓您能夠平行處理多個任務。您將學習如何設定 `TeamAgent` 以同時執行不同的分析，並有效率地合併結果。

## 總覽

在許多真實世界的場景中，一個複雜的問題可以被分解為更小、獨立的子任務。與其循序處理這些任務，不如同時執行它們以節省時間。本範例展示了一種常見的並行模式，其中單一輸入（產品描述）由不同的 Agent 從多個角度進行分析。然後，它們各自的輸出會被匯總成一個最終的、全面的結果。

此工作流程的結構如下：

```d2
direction: down

Input: {
  label: "輸入\n(產品描述)"
  shape: oval
}

TeamAgent: {
  label: "平行處理 (TeamAgent)"
  shape: rectangle

  Feature-Extractor: {
    label: "特徵提取器"
    shape: rectangle
  }

  Audience-Analyzer: {
    label: "受眾分析器"
    shape: rectangle
  }
}

Aggregation: {
  label: "匯總"
  shape: diamond
}

Output: {
  label: "輸出\n({ features, audience })"
  shape: oval
}

Input -> TeamAgent.Feature-Extractor
Input -> TeamAgent.Audience-Analyzer
TeamAgent.Feature-Extractor -> Aggregation: "features"
TeamAgent.Audience-Analyzer -> Aggregation: "audience"
Aggregation -> Output
```

- **輸入**：提供一個產品描述給工作流程。
- **平行處理**：
    - 一個 `Feature Extractor` Agent 分析描述以識別關鍵產品特徵。
    - 一個 `Audience Analyzer` Agent 同時分析相同的描述以確定目標受眾。
- **匯總**：收集來自兩個 Agent 的輸出（`features` 和 `audience`）。
- **輸出**：回傳一個包含提取的特徵和受眾分析的單一結構化物件。

此範例支援用於單一輸入的單次執行模式，以及用於對話式分析的互動式聊天模式。

## 先決條件

在執行此範例之前，請確保您的系統符合以下要求：

- [Node.js](https://nodejs.org) (版本 20.0 或更高)。
- 一個 [OpenAI API 金鑰](https://platform.openai.com/api-keys)。

## 快速入門

您可以使用 `npx` 直接從命令列執行此範例，無需複製儲存庫。

### 執行範例

在您的終端機中執行以下其中一個指令。

若要以預設的單次執行模式執行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-workflow-concurrency
```

若要在互動式聊天會話中執行：
```bash npx command icon=lucide:terminal
npx -y @aigne/example-workflow-concurrency --chat
```

若要透過管道提供輸入：
```bash npx command icon=lucide:terminal
echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | npx -y @aigne/example-workflow-concurrency
```

### 連線至 AI 模型

當您首次執行此範例時，系統會提示您連線至 AI 模型提供者。

![連線至模型提供者](/media/examples/workflow-concurrency/run-example.png)

您有以下幾種連線選項：

1. **AIGNE Hub (官方)**：推薦給新使用者的選項。它提供免費權杖以供入門。
2. **AIGNE Hub (自行託管)**：適用於正在執行自己 AIGNE Hub 實例的使用者。
3. **第三方模型提供者**：您可以透過將所需的 API 金鑰設定為環境變數，直接連線至像 OpenAI 這樣的提供者。

例如，若要直接使用 OpenAI：
```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```
設定環境變數後，再次執行 `npx` 指令。

## 安裝與本地設定

若要進行開發，您可以複製儲存庫並從原始碼執行此範例。

### 1. 複製儲存庫

```bash 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝依賴項

導覽至範例目錄並使用 `pnpm` 安裝必要的套件。

```bash 安裝依賴項 icon=lucide:terminal
cd aigne-framework/examples/workflow-concurrency
pnpm install
```

### 3. 在本地執行範例

使用 `pnpm start` 指令來執行腳本。

若要以單次執行模式執行：
```bash 以單次執行模式執行 icon=lucide:terminal
pnpm start
```

若要在互動式聊天模式下執行，請加入 `--chat` 旗標。請注意，傳遞給 `pnpm start` 的參數必須以 `--` 開頭。
```bash 以聊天模式執行 icon=lucide:terminal
pnpm start -- --chat
```

若要使用管道輸入：
```bash 使用管道輸入執行 icon=lucide:terminal
echo "Analyze product: Smart home assistant with voice control and AI learning capabilities" | pnpm start
```

## 程式碼實作

核心邏輯是使用一個設定為平行執行的 `TeamAgent` 來實作的。團隊中定義了兩個 `AIAgent` 實例作為技能：一個用於特徵提取，另一個用於受眾分析。

```typescript index.ts icon=logos:typescript
import { AIAgent, AIGNE, ProcessMode, TeamAgent } from "@aigne/core";
import { OpenAIChatModel } from "@aigne/core/models/openai-chat-model.js";

const { OPENAI_API_KEY } = process.env;

// 初始化 OpenAI 模型
const model = new OpenAIChatModel({
  apiKey: OPENAI_API_KEY,
});

// 定義第一個 Agent 來提取產品特徵
const featureExtractor = AIAgent.from({
  instructions: `\
You are a product analyst. Extract and summarize the key features of the product.\n\nProduct description:\n{{product}}`,
  outputKey: "features",
});

// 定義第二個 Agent 來分析目標受眾
const audienceAnalyzer = AIAgent.from({
  instructions: `\
You are a market researcher. Identify the target audience for the product.\n\nProduct description:\n{{product}}`,
  outputKey: "audience",
});

// 初始化 AIGNE 實例
const aigne = new AIGNE({ model });

// 建立一個 TeamAgent 來管理平行工作流程
const teamAgent = TeamAgent.from({
  skills: [featureExtractor, audienceAnalyzer],
  mode: ProcessMode.parallel, // 將執行模式設定為平行
});

// 呼叫團隊並提供產品描述
const result = await aigne.invoke(teamAgent, {
  product: "AIGNE is a No-code Generative AI Apps Engine",
});

console.log(result);

/* 預期輸出：
{
  features: "**Product Name:** AIGNE\n\n**Product Type:** No-code Generative AI Apps Engine\n\n...",
  audience: "**Small to Medium Enterprises (SMEs)**: \n   - Businesses that may not have extensive IT resources or budget for app development but are looking to leverage AI to enhance their operations or customer engagement.\n\n...",
}
*/
```

### 關鍵概念

-   **`AIAgent`**：代表一個具有特定指令的獨立 AI 工作者。在這裡，`featureExtractor` 和 `audienceAnalyzer` 都是 `AIAgent` 的實例。
-   **`TeamAgent`**：一個協調其他 Agent (技能) 的 Agent。它可以循序或平行執行它們。
-   **`ProcessMode.parallel`**：`TeamAgent` 上的此設定指示它同時執行其所有技能。`TeamAgent` 會等待所有平行任務完成後，再匯總它們的輸出。
-   **`outputKey`**：每個 `AIAgent` 中的此屬性定義了其結果將儲存在最終輸出物件中的鍵。

## 命令列選項

此範例腳本接受幾個命令列參數來自訂其行為。

| 參數 | 說明 | 預設值 |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ |
| `--chat` | 以互動式聊天模式執行 Agent，而非單次執行。 | 已停用 |
| `--model <provider[:model]>` | 指定要使用的 AI 模型，例如 `openai` 或 `openai:gpt-4o-mini`。 | `openai` |
| `--temperature <value>` | 設定模型生成的溫度以控制創造力。 | 提供者預設值 |
| `--top-p <value>` | 設定 top-p (核心取樣) 值。 | 提供者預設值 |
| `--presence-penalty <value>` | 設定存在懲罰值以避免重複的權杖。 | 提供者預設值 |
| `--frequency-penalty <value>` | 設定頻率懲罰值以避免重複頻繁的權杖。 | 提供者預設值 |
| `--log-level <level>` | 設定日誌記錄的詳細程度。可接受的值為 `ERROR`、`WARN`、`INFO`、`DEBUG`、`TRACE`。 | `INFO` |
| `--input`, `-i <input>` | 直接以參數形式提供輸入。 | 無 |

#### 使用範例

若要以特定模型和日誌級別在聊天模式下執行：
```bash 指令範例 icon=lucide:terminal
pnpm start -- --chat --model openai:gpt-4o-mini --log-level DEBUG
```

## 偵錯

您可以使用 AIGNE 觀察伺服器來監控和分析 Agent 的執行情況。此工具提供了一個基於 Web 的介面，用於檢查追蹤、查看每個步驟的詳細資訊，並了解 Agent 的執行期行為。

首先，在一個獨立的終端機視窗中啟動觀察伺服器：
```bash 啟動觀察器 icon=lucide:terminal
aigne observe
```

![啟動觀察伺服器](/media/examples/images/aigne-observe-execute.png)

執行範例後，您可以開啟 Web 介面（通常在 `http://localhost:3333`）來查看最近的執行列表，並深入了解並行工作流程的詳細資訊。

![檢視執行列表](/media/examples/images/aigne-observe-list.png)