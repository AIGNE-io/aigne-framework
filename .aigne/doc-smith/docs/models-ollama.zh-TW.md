# Ollama

`@aigne/ollama` 套件在 AIGNE 框架與透過 [Ollama](https://ollama.ai/) 本地託管的 AI 模型之間提供了無縫整合。這讓開發者能夠利用在自有硬體上運行的各種開源語言模型，確保隱私和對 AI 功能的離線存取。

本指南涵蓋了在您的 AIGNE 應用程式中設定和使用 `OllamaChatModel` 的必要步驟。有關其他模型提供商的資訊，請參閱 [模型總覽](./models-overview.md)。

下圖說明了 AIGNE 框架如何與本地 Ollama 實例互動。

<!-- DIAGRAM_IMAGE_START:guide:4:3 -->
![Ollama](assets/diagram/ollama-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 先決條件

在使用此套件之前，您必須在本地機器上安裝並執行 Ollama。您還需要拉取至少一個模型。有關詳細說明，請參閱 [Ollama 官方網站](https://ollama.ai/)。

## 安裝

若要開始，請使用您偏好的套件管理器安裝必要的 AIGNE 套件。

<x-cards data-columns="3">
  <x-card data-title="npm" data-icon="logos:npm-icon">
    ```bash
    npm install @aigne/ollama @aigne/core
    ```
  </x-card>
  <x-card data-title="yarn" data-icon="logos:yarn">
    ```bash
    yarn add @aigne/ollama @aigne/core
    ```
  </x-card>
  <x-card data-title="pnpm" data-icon="logos:pnpm">
    ```bash
    pnpm add @aigne/ollama @aigne/core
    ```
  </x-card>
</x-cards>

## 設定

`OllamaChatModel` 類別是與 Ollama 互動的主要介面。在實例化模型時，您可以提供多個設定選項來自訂其行為。

```typescript OllamaChatModel 實例化 icon=logos:typescript-icon
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  // 指定要使用的 Ollama 模型
  model: "llama3",
  
  // 您的本地 Ollama 實例的基礎 URL
  baseURL: "http://localhost:11434/v1",

  // 傳遞給模型的選用參數
  modelOptions: {
    temperature: 0.7,
  },
});
```

建構函式接受以下參數：

<x-field-group>
  <x-field data-name="model" data-type="string" data-default="llama3.2" data-required="false">
    <x-field-desc markdown>要使用的模型名稱（例如 `llama3`、`mistral`）。請確保該模型已在您的 Ollama 實例中拉取。</x-field-desc>
  </x-field>
  <x-field data-name="baseURL" data-type="string" data-default="http://localhost:11434/v1" data-required="false">
    <x-field-desc markdown>Ollama API 的基礎 URL。也可以使用 `OLLAMA_BASE_URL` 環境變數進行設定。</x-field-desc>
  </x-field>
  <x-field data-name="apiKey" data-type="string" data-default="ollama" data-required="false">
    <x-field-desc markdown>一個佔位 API 金鑰。Ollama 預設不需要身份驗證，但 AIGNE 框架需要一個非空金鑰。其預設值為 `"ollama"`，並可透過 `OLLAMA_API_KEY` 環境變數設定。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false">
    <x-field-desc markdown>一個包含要傳遞給 Ollama API 的額外參數的物件，例如 `temperature`、`top_p` 等。這些選項可用於微調模型的回應生成。</x-field-desc>
  </x-field>
</x-field-group>

## 基本用法

若要執行模型，請使用 `invoke` 方法。傳遞一個訊息負載以生成聊天完成項。

```typescript 基本叫用 icon=logos:typescript-icon
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
  modelOptions: {
    temperature: 0.8,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Explain the importance of local AI models." }],
});

console.log(result.text);
```

`invoke` 方法會回傳一個解析為包含模型回應物件的 promise。

**範例回應**
```json
{
  "text": "本地 AI 模型之所以至關重要，有幾個原因。首先，它們提供了增強的隱私和安全性，因為資料是在裝置上處理，永遠不會離開使用者的機器...",
  "model": "llama3"
}
```

## 串流回應

對於需要即時互動的應用程式，您可以串流模型的回應。在 `invoke` 方法中將 `streaming` 選項設定為 `true`。該方法將回傳一個非同步迭代器，在回應區塊可用時產生它們。

```typescript 串流範例 icon=logos:typescript-icon
import { isAgentResponseDelta } from "@aigne/core";
import { OllamaChatModel } from "@aigne/ollama";

const model = new OllamaChatModel({
  model: "llama3",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Tell me a short story about a robot." }],
  },
  { streaming: true },
);

let fullText = "";
process.stdout.write("Response: ");

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
console.log("Full text:", fullText);
```

此範例示範如何處理串流。每個區塊都是完整回應的增量。您可以累積每個區塊的文字以重構完整的訊息。

## 總結

`@aigne/ollama` 套件提供了一種強大而直接的方式，將本地的開源模型整合到您的 AIGNE 應用程式中。透過遵循本指南中的步驟，您可以設定 `OllamaChatModel`，根據您的需求進行配置，並利用標準和串流兩種完成方式。

有關其他可用模型的更多資訊，請參閱以下指南：
- [OpenAI](./models-openai.md)
- [Google Gemini](./models-gemini.md)
- [Anthropic](./models-anthropic.md)