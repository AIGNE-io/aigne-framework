本文件為 `@aigne/bedrock` 套件提供了全面的使用指南，此 SDK 旨在將 AWS Bedrock 基礎模型整合至 AIGNE 框架中。您將學習如何安裝此套件、向 AWS 進行身份驗證、執行基本操作，以及利用串流和工具使用等進階功能。

### 目標讀者

本文件適用於希望在其基於 AIGNE 的應用程式中使用 AWS Bedrock 生成式 AI 模型的開發人員。我們假設讀者對 TypeScript、Node.js 和 AIGNE 框架有基本的了解。

# @aigne/bedrock

`@aigne/bedrock` 提供了 AIGNE 框架與 AWS Bedrock 之間的無縫連接。它為利用各種基礎模型提供了一致、類型安全的介面，讓您能在 AWS 安全且可擴展的基礎架構之上建立強大的 AI 功能。

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-bedrock.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-bedrock.png" alt="AIGNE Bedrock Architecture">
</picture>

## 功能

-   **無縫整合 AWS Bedrock**：使用官方 AWS SDK，以最少的設定連接至 AWS Bedrock。
-   **支援多種模型**：存取包括 Claude、Llama、Titan 等多種基礎模型。
-   **聊天完成 API**：一個統一的介面，用於所有支援模型的聊天互動。
-   **串流回應**：內建串流支援，以建立反應靈敏的即時應用程式。
-   **類型安全**：完全使用 TypeScript 進行類型定義，確保安全性並改善開發者體驗。
-   **相容 AIGNE 框架**：遵循 AIGNE 框架的模型介面，以實現一致的使用方式。
-   **穩健的錯誤處理**：包含處理錯誤和重試請求的機制。
-   **豐富的設定選項**：提供多種選項以微調模型行為。

## 安裝

首先，請安裝 `@aigne/bedrock` 以及核心的 AIGNE 套件。

**npm**
```bash
npm install @aigne/bedrock @aigne/core
```

**yarn**
```bash
yarn add @aigne/bedrock @aigne/core
```

**pnpm**
```bash
pnpm add @aigne/bedrock @aigne/core
```

## 身份驗證

`BedrockChatModel` 需要 AWS 憑證才能發出經過驗證的請求。您可以透過兩種方式提供：

1.  **直接在建構函式中**：將您的憑證作為 `accessKeyId` 和 `secretAccessKey` 選項傳入。
2.  **環境變數**：如果您的環境中設定了 `AWS_ACCESS_KEY_ID`、`AWS_SECRET_ACCESS_KEY` 和 `AWS_REGION` 環境變數，SDK 將會自動偵測並使用它們。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";

// 選項 1：直接實例化
const modelWithKeys = new BedrockChatModel({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  region: "us-east-1", // 指定您的 AWS 區域
});

// 選項 2：使用環境變數（建議在生產環境中使用）
// process.env.AWS_ACCESS_KEY_ID = "YOUR_ACCESS_KEY_ID";
// process.env.AWS_SECRET_ACCESS_KEY = "YOUR_SECRET_ACCESS_KEY";
// process.env.AWS_REGION = "us-east-1";
const modelFromEnv = new BedrockChatModel();
```

## 基本用法

與 AWS Bedrock 互動的主要類別是 `BedrockChatModel`。以下是如何實例化模型並取得回應的基本範例。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";

async function getChatResponse() {
  const model = new BedrockChatModel({
    // 假設已設定環境變數進行身份驗證
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0", // 指定模型 ID
    modelOptions: {
      temperature: 0.7,
    },
  });

  const result = await model.invoke({
    messages: [{ role: "user", content: "Hello, what is the AIGNE Framework?" }],
  });

  console.log(result.text);
  console.log("Usage:", result.usage);
}

getChatResponse();
/* 預期輸出：
Hello! The AIGNE Framework is a toolkit for...
Usage: { inputTokens: 15, outputTokens: 50 }
*/
```

## API 參考

### `BedrockChatModel`

`BedrockChatModel` 類別是使用此 SDK 的主要入口點。

**建構函式選項 (`BedrockChatModelOptions`)**

<x-field-group>
  <x-field data-name="accessKeyId" data-type="string" data-required="false" data-desc="您的 AWS 存取金鑰 ID。若未提供，則使用 `AWS_ACCESS_KEY_ID` 環境變數。"></x-field>
  <x-field data-name="secretAccessKey" data-type="string" data-required="false" data-desc="您的 AWS 私密存取金鑰。若未提供，則使用 `AWS_SECRET_ACCESS_KEY` 環境變數。"></x-field>
  <x-field data-name="region" data-type="string" data-required="false" data-desc="Bedrock 服務的 AWS 區域（例如 'us-east-1'）。若未提供，則使用 `AWS_REGION` 環境變數。"></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="用於請求的預設模型 ID（例如 'anthropic.claude-3-haiku-20240307-v1:0'）。預設為 `us.amazon.nova-lite-v1:0`。"></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="模型推論的預設選項。">
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="控制隨機性。值越低，模型越具確定性。"></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="核心取樣參數。"></x-field>
  </x-field>
  <x-field data-name="clientOptions" data-type="BedrockRuntimeClientConfig" data-required="false" data-desc="直接傳遞給 AWS `BedrockRuntimeClient` 的進階設定選項。"></x-field>
</x-field-group>

## 進階用法

### 串流回應

對於即時應用程式，您可以在模型生成回應時以串流方式接收。在 `invoke` 方法中設定 `streaming: true` 選項即可。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { isAgentResponseDelta } from "@aigne/core";

async function streamChatResponse() {
  const model = new BedrockChatModel({
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
  });

  const stream = await model.invoke(
    {
      messages: [{ role: "user", content: "Tell me a short story about a robot." }],
    },
    { streaming: true },
  );

  let fullText = "";
  for await (const chunk of stream) {
    if (isAgentResponseDelta(chunk)) {
      const text = chunk.delta.text?.text;
      if (text) {
        fullText += text;
        process.stdout.write(text);
      }
    }
  }

  console.log("\n\n--- End of Stream ---");
  console.log("Final Text:", fullText);
}

streamChatResponse();
```

下圖說明了串流操作期間的資料流程：

```d2
shape: sequence_diagram

Application: {
  label: "您的應用程式"
}
Aigne-Bedrock-SDK: {
  label: "@aigne/bedrock SDK"
}
AWS-Bedrock: {
  label: "AWS Bedrock"
}
Foundation-Model: {
  label: "基礎模型"
}

Application -> Aigne-Bedrock-SDK: "1. invoke(..., { streaming: true })"
Aigne-Bedrock-SDK -> AWS-Bedrock: "2. 傳送串流 API 請求"
AWS-Bedrock -> Foundation-Model: "3. 將請求轉發至模型"

loop: "即時回應生成" {
  Foundation-Model -> AWS-Bedrock: "4a. 生成文字區塊"
  AWS-Bedrock -> Aigne-Bedrock-SDK: "4b. 將區塊串流回傳"
  Aigne-Bedrock-SDK -> Application: "4c. 透過非同步迭代器產生區塊"
}

AWS-Bedrock -> Aigne-Bedrock-SDK: "5. 串流結束訊號"
Aigne-Bedrock-SDK -> Application: "6. 串流關閉"
```

### 結構化 JSON 輸出

您可以指示模型回傳一個符合特定 Zod 結構的結構化 JSON 物件。這對於生成可預測、機器可讀的輸出很有用。

為此，請定義一個 Zod 結構，並將其傳入 `invoke` 方法的 `responseFormat` 選項中。SDK 將自動提示模型使用 `generate_json` 工具來產生所需的輸出。

```typescript
import { BedrockChatModel } from "@aigne/bedrock";
import { z } from "zod";

async function getStructuredResponse() {
  const model = new BedrockChatModel({
    region: "us-east-1",
    model: "anthropic.claude-3-sonnet-20240229-v1:0",
  });

  const userSchema = z.object({
    name: z.string().describe("使用者的全名。"),
    email: z.string().email().describe("使用者的電子郵件地址。"),
    age: z.number().positive().describe("使用者的年齡。"),
  });

  const result = await model.invoke({
    messages: [
      {
        role: "user",
        content: "Extract user information from the following text: John Doe is 30 years old and his email is john.doe@example.com.",
      },
    ],
    responseFormat: {
      type: "json_schema",
      jsonSchema: {
        schema: userSchema,
      },
    },
  });

  console.log(result.json);
}

getStructuredResponse();
/* 預期輸出：
{
  name: "John Doe",
  email: "john.doe@example.com",
  age: 30
}
*/
```