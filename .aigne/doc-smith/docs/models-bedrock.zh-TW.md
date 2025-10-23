# AWS Bedrock

`@aigne/bedrock` 套件提供了 AIGNE 框架與 Amazon Web Services (AWS) Bedrock 之間直接且穩固的整合。這讓開發人員能夠在其 AIGNE 應用程式中，利用 AWS Bedrock 提供的各種基礎模型，既能享受 AWS 可擴展且安全的基礎設施，又能維持一致的介面。

本指南對 `BedrockChatModel` 的安裝、設定和使用方式提供了系統性的概覽。有關其他模型的詳細資訊，請參閱主要的 [模型概覽](./models-overview.md)。

## 安裝

首先，使用您偏好的套件管理器安裝必要的套件。`@aigne/core` 套件是必要的對等依賴項 (peer dependency)。

```bash Terminal
# 使用 npm
npm install @aigne/bedrock @aigne/core

# 使用 yarn
yarn add @aigne/bedrock @aigne/core

# 使用 pnpm
pnpm add @aigne/bedrock @aigne/core
```

## 設定

正確的設定涉及設定 AWS 憑證，並使用所需的參數將 `BedrockChatModel` 實例化。

### AWS 憑證

AWS SDK 需要憑證來驗證請求。您可透過以下兩種方式之一提供：

1.  **環境變數 (建議)**：在您的開發或部署環境中設定以下環境變數。SDK 將會自動偵測並使用它們。
    *   `AWS_ACCESS_KEY_ID`：您的 AWS access key ID。
    *   `AWS_SECRET_ACCESS_KEY`：您的 AWS secret access key。
    *   `AWS_REGION`：您的 Bedrock 服務啟用的 AWS 區域 (例如：`us-east-1`)。

2.  **直接實例化**：直接將憑證傳遞給 `BedrockChatModel` 的建構函式。此方法適用於特定使用情境，但通常不如使用環境變數安全。

### BedrockChatModel 選項

`BedrockChatModel` 是與 AWS Bedrock 互動的主要類別。其建構函式接受一個選項物件來設定其行為。

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false">
    <x-field-desc markdown>您的 AWS access key ID。若未提供，SDK 將會嘗試從 `AWS_ACCESS_KEY_ID` 環境變數讀取。</x-field-desc>
  </x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false">
    <x-field-desc markdown>您的 AWS secret access key。若未提供，SDK 將會嘗試從 `AWS_SECRET_ACCESS_KEY` 環境變數讀取。</x-field-desc>
  </x-field>
  <x-field data-name="region" data-type="string" data-required="false">
    <x-field-desc markdown>Bedrock 服務的 AWS 區域。若未提供，SDK 將會嘗試從 `AWS_REGION` 環境變數讀取。</x-field-desc>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-default="us.amazon.nova-lite-v1:0">
    <x-field-desc markdown>要使用的基礎模型 ID (例如：`anthropic.claude-3-sonnet-20240229-v1:0`、`meta.llama3-8b-instruct-v1:0`)。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>用以控制模型推論行為的額外選項。</x-field-desc>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制生成內容的隨機性。值越高，回應越具創意。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="控制核心取樣。模型僅會考慮機率總和為 top P 的詞元。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="object" data-required="false">
    <x-field-desc markdown>直接傳遞給 AWS SDK 底層 `BedrockRuntimeClient` 的進階設定選項。</x-field-desc>
  </x-field>
</x-field-group>

## 使用範例

以下範例示範如何使用 `BedrockChatModel` 進行標準和串流兩種呼叫。

### 基本用法

此範例展示如何將模型實例化並呼叫它以獲得單一、完整的回應。

```typescript Basic Invocation icon=logos:javascript
import { BedrockChatModel } from "@aigne/bedrock";

// 使用憑證和模型 ID 將模型實例化
const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID", // 或使用環境變數
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY", // 或使用環境變數
  region: "us-east-1", // 指定您的 AWS 區域
  model: "anthropic.claude-3-haiku-20240307-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

// 定義輸入訊息
const result = await model.invoke({
  messages: [{ role: "user", content: "Hello, what is AWS Bedrock?" }],
});

console.log(result.text);
```

輸出將是一個包含模型回應的字串。`result` 物件也包含用量指標。

### 串流回應

對於需要即時回饋的應用程式，您可以在回應生成時以串流方式傳輸。這對於聊天機器人和其他互動式體驗很有用。

```typescript Streaming Invocation icon=logos:javascript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

const model = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  region: "us-east-1",
  model: "anthropic.claude-3-haiku-20240307-v1:0",
  modelOptions: {
    temperature: 0.7,
  },
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Hello, what is AWS Bedrock?" }],
  },
  { streaming: true },
);

let fullText = "";

for await (const chunk of stream) {
  // 使用類型守衛檢查 chunk 是否為 delta
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) {
      fullText += text;
      process.stdout.write(text); // 在回應的每個部分到達時即時印出
    }
  }
}

console.log("\n--- Full Response ---");
console.log(fullText);
```

此程式碼處理一個 `AgentResponseChunk` 物件的串流。每個區塊 (chunk) 包含回應的增量部分 (delta)，這些部分會被累積起來形成完整的文本。

## 支援的模型

AWS Bedrock 提供了來自 Anthropic、Cohere、Meta、Stability AI 和 Amazon 等頂尖 AI 公司的多種基礎模型。您可以使用其唯一的 `modelId` 來指定所需的模型。

一些常用的模型系列包括：
-   **Anthropic Claude**：`anthropic.claude-3-sonnet-20240229-v1:0`、`anthropic.claude-3-haiku-20240307-v1:0`
-   **Meta Llama**：`meta.llama3-8b-instruct-v1:0`
-   **Amazon Titan**：`amazon.titan-text-express-v1`

有關可用模型及其對應 ID 的完整且最新的列表，請參閱 [AWS Bedrock 官方文件](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html)。

## 總結

`@aigne/bedrock` 套件提供了一種簡便的方式，將來自 AWS Bedrock 的強大基礎模型整合到您的 AIGNE 應用程式中。遵循本指南中概述的設定步驟和使用模式，您可以高效地建構和部署由 AI 驅動的功能。

有關更進階的主題，例如工具使用和結構化輸出，請參閱 [AI Agent](./developer-guide-agents-ai-agent.md) 文件。