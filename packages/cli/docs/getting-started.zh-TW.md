---
labels: ["Reference"]
---

---
labels: ["參考"]
---

# 入門指南

本指南將引導您完成安裝 AIGNE CLI、建立新專案以及執行您的第一個 AI agent 的基本步驟。完成後，您將擁有一個在本機運行的 agent。

## 步驟 1：安裝 AIGNE CLI

首先，您需要在您的系統上全域安裝 `@aigne/cli` 套件。您可以使用您偏好的 JavaScript 套件管理器。

### 使用 npm

```bash
npm install -g @aigne/cli
```

### 使用 yarn

```bash
yarn global add @aigne/cli
```

### 使用 pnpm

```bash
pnpm add -g @aigne/cli
```

## 步驟 2：建立新專案

安裝 CLI 後，您可以使用 `aigne create` 命令來建立一個新的 AIGNE 專案。此命令會使用預設的 agent 範本建立一個新目錄，其中包含所有必要的設定檔。

```bash
aigne create my-first-agent
```

接著，CLI 將引導您完成一個互動式的設定過程。系統會提示您確認專案名稱並選擇一個範本。在本指南中，您可以直接按 Enter 鍵接受預設選項。

![互動式專案建立提示](../assets/create/create-project-interactive-project-name-prompt.png)

該過程完成後，您將看到一條成功訊息，其中包含如何開始使用您的新 agent 的說明。

![專案建立成功訊息](../assets/create/create-project-using-default-template-success-message.png)

## 步驟 3：設定環境變數

在執行 agent 之前，您需要設定您的 AI 模型提供者的 API 金鑰。

首先，請導覽至您新建立的專案目錄中：
```bash
cd my-first-agent
```

專案範本中包含一個名為 `.env.local.example` 的範例環境檔案。請將其複製為一個名為 `.env.local` 的新檔案，以建立您的本機設定。
```bash
cp .env.local.example .env.local
```

現在，在您的編輯器中開啟 `.env.local` 檔案。您需要新增您的 OpenAI API 金鑰。預設範本已預先設定為使用 OpenAI。

```shell .env.local icon=mdi:file-document-edit-outline
# OpenAI
MODEL="openai:gpt-4o-mini"
OPENAI_API_KEY="您的_OPENAI_API_金鑰"
```

請將 `"您的_OPENAI_API_金鑰"` 替換為您的實際金鑰。

## 步驟 4：執行您的 Agent

設定完成後，您現在可以執行您的 agent。請在您的專案目錄中執行 `aigne run` 命令。

```bash
aigne run
```

此命令會與您專案中定義的預設 agent 啟動一個互動式聊天會話。您現在可以直接在終端機中開始發送訊息並與您的 AI agent 互動。

![在聊天模式下執行預設 agent](../assets/run/run-default-template-project-in-chat-mode.png)

## 後續步驟

恭喜！您已成功安裝 AIGNE CLI、建立專案並執行了您的第一個 agent。

若要了解您剛建立的檔案以及 AIGNE 專案的結構，請前往 [核心概念](./core-concepts.md) 章節。