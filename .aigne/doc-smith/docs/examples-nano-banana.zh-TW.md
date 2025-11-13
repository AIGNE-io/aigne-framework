# Nano Banana

本文件提供逐步指南，說明如何使用 AIGNE 框架建立並執行具備影像生成功能的聊天機器人。您將學習如何直接從命令列執行此範例、將其連接至各種 AI 模型提供者，以及對其操作進行偵錯。

## 概覽

「Nano Banana」範例透過結合語言模型和影像生成模型，展示了 AIGNE 框架的實際應用。一個 AI Agent 被設定為解讀使用者的文字提示並產生相應的影像。此範例旨在快速上手，無需任何本機安裝即可執行。

下圖說明了 Nano Banana 範例從使用者輸入到影像生成的工作流程：

```d2
direction: down

User: {
  shape: c4-person
}

CLI: {
  label: "CLI"
}

Nano-Banana-Example: {
  label: "Nano Banana 範例\n(AI Agent)"
  shape: rectangle

  Language-Model: {
    label: "語言模型\n(提示解讀)"
    shape: rectangle
  }

  Image-Generation-Model: {
    label: "影像生成模型\n(影像建立)"
    shape: rectangle
  }
}

AI-Model-Provider: {
  label: "AI 模型提供者\n(例如 OpenAI)"
  shape: cylinder
}

User -> CLI: "1. 執行指令\n(例如 npx ... --input '...a cat')"
CLI -> Nano-Banana-Example: "2. 使用文字提示執行 Agent"
Nano-Banana-Example.Language-Model -> AI-Model-Provider: "3. 處理提示"
AI-Model-Provider -> Nano-Banana-Example.Image-Generation-Model: "4. 根據處理後的提示生成影像"
Nano-Banana-Example -> User: "5. 回傳生成的影像"

```

## 先決條件

為成功執行此範例，您的系統上必須具備以下元件：

*   **Node.js**：版本 20.0 或更高版本。可從 [nodejs.org](https://nodejs.org) 下載。
*   **npm**：Node 套件管理器，隨 Node.js 一併安裝。
*   **AI 模型提供者 API 金鑰**：與 AI 服務互動所需。需要來自 [OpenAI](https://platform.openai.com/api-keys) 等提供者的 API 金鑰。

## 快速入門 (無需安裝)

此範例可使用 `npx` 直接從您的終端機執行，無需本機安裝。

### 使用單一輸入執行

若要根據特定的文字提示生成影像，請使用 `--input` 旗標。該指令將執行一次並輸出結果。

```bash 使用單一輸入執行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --input 'Draw an image of a lovely cat'
```

### 以互動式聊天模式執行

若要進行連續的對話式會話，請使用 `--chat` 旗標。這將啟動一個互動模式，您可以在其中提交多個提示。

```bash 以互動模式執行 icon=lucide:terminal
npx -y @aigne/example-nano-banana --chat
```

## 連接至 AI 模型

首次執行時，應用程式將提示您連接至 AI 模型。有幾種方法可以建立此連線。

![終端機提示使用者為 AI 模型選擇連接方式。](/media/examples/nano-banana/run-example.png)

### 1. 透過 AIGNE Hub (官方) 連接

這是推薦給新使用者的方法。

1.  選擇第一個選項，透過官方 AIGNE Hub 進行連接。
2.  您的預設網頁瀏覽器將開啟 AIGNE Hub 連接頁面。
3.  依照螢幕上的指示完成連接。新使用者將獲得一定數量的免費權杖供試用。

![網頁瀏覽器中顯示 AIGNE Hub 連接頁面。](/media/examples/images/connect-to-aigne-hub.png)

### 2. 透過自行託管的 AIGNE Hub 連接

如果您或您的組織營運私有的 AIGNE Hub 執行個體，請使用此選項。

1.  在終端機中選擇第二個選項。
2.  在提示時輸入您自行託管的 AIGNE Hub 的 URL。
3.  依照後續提示完成連接。

若要部署自行託管的 AIGNE Hub，您可以從 [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ) 安裝。

![終端機提示輸入自行託管的 AIGNE Hub 的 URL。](/media/examples/images/connect-to-self-hosted-aigne-hub.png)

### 3. 透過第三方模型提供者連接

您可以透過將 API 金鑰設定為環境變數，直接連接到第三方模型提供者，例如 OpenAI。

例如，若要使用 OpenAI，請在您的 shell 中設定 `OPENAI_API_KEY` 變數：

```bash 設定 OpenAI API 金鑰 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key-here"
```

設定環境變數後，再次執行執行指令。有關設定其他提供者的詳細資訊，請參閱[模型設定](./models-configuration.md)指南。

## 安裝與本機執行

對於希望檢查或修改原始碼的使用者，可以從儲存庫的本機副本執行此範例。

### 1. 複製儲存庫

使用 `git` 將 AIGNE 框架儲存庫複製到您的本機電腦。

```bash 複製儲存庫 icon=lucide:terminal
git clone https://github.com/AIGNE-io/aigne-framework
```

### 2. 安裝相依性

導覽至範例的目錄，並使用 `pnpm` 安裝所需的相依性。

```bash 安裝相依性 icon=lucide:terminal
cd aigne-framework/examples/nano-banana
pnpm install
```

### 3. 執行範例

執行專案中定義的 `start` 指令碼以執行應用程式。

```bash 執行本機範例 icon=lucide:terminal
pnpm start
```

## 偵錯

AIGNE 框架包含 `aigne observe`，這是一個命令列工具，可啟動本機網頁伺服器以監控和分析 Agent 執行情況。

1.  **啟動觀察伺服器**：在您的終端機中，執行 `aigne observe` 指令。

    ![在終端機中執行 'aigne observe' 指令。](/media/examples/images/aigne-observe-execute.png)

2.  **檢視執行情況**：該指令將輸出一個 URL。在您的瀏覽器中開啟此 URL 以存取觀察介面，其中列出了最近的 Agent 執行情況。

    ![AIGNE Observe 網頁介面顯示了最近的 Agent 執行清單。](/media/examples/images/aigne-observe-list.png)

3.  **檢查執行詳情**：點擊一次執行以檢視其詳細追蹤，包括對模型和工具的呼叫。此介面對偵錯、效能分析和理解 Agent 行為非常有價值。

## 總結

本指南詳細介紹了使用 AIGNE 框架執行影像生成聊天機器人的過程。您已學會如何使用 `npx` 執行範例、連接至 AI 模型、從原始碼執行，以及利用 `aigne observe` 工具進行偵錯。

有關相關主題的進一步資訊，請參閱以下文件：

<x-cards data-columns="2">
  <x-card data-title="Image Agent" data-icon="lucide:image" data-href="/developer-guide/agents/image-agent">
    了解更多關於生成影像的特定設定。
  </x-card>
  <x-card data-title="AIGNE CLI" data-icon="lucide:terminal" data-href="https://github.com/AIGNE-io/aigne-framework/blob/main/packages/cli/README.md">
    探索 AIGNE 命令列介面的全部功能。
  </x-card>
</x-cards>