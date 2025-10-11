---
labels: ["Reference"]
---

---
labels: ["參考"]
---

# aigne run

`aigne run` 指令是執行 AIGNE agent 的主要方式。它可以從本地專案目錄或直接從遠端 URL 執行 agent。它提供了一套靈活的選項，用於提供輸入、設定 AI 模型和處理輸出，包括用於對話式 agent 的互動式聊天模式。

## 用法

```bash 基本語法
aigne run [path] [agent_name] [options]
```

### 引數

-   `[path]` (選用)：AIGNE 專案目錄的路徑或遠端 URL（例如 Git 儲存庫）。如果省略，預設為當前目錄 (`.`)。
-   `[agent_name]` (選用)：要從專案中執行的特定 agent。如果未指定，CLI 將使用 `aigne.yaml` 中定義的 `entry-agent` 或預設的 `chat` agent，若皆無則會使用列表中的第一個 agent。

## 運作方式

`run` 指令首先會載入 AIGNE 應用程式。如果提供了遠端 URL，它會在繼續之前下載並在本機快取專案。然後，它會解析命令列引數，並使用給定的輸入和模型設定來執行指定的 agent。

```d2 遠端執行流程 icon=lucide:workflow
direction: down

User: {
  shape: c4-person
  label: "使用者"
}

CLI: {
  label: "@aigne/cli"
  
  Download: {
    label: "下載套件"
  }

  Extract: {
    label: "解壓縮套件"
  }

  Load: {
    label: "載入應用程式"
  }

  Execute: {
    label: "執行 Agent"
  }
}

Remote-URL: {
  label: "遠端 URL\n（例如 GitHub）"
  shape: cylinder
}

Cache-Dir: {
  label: "快取目錄\n(~/.aigne/.download)"
  shape: cylinder
}

Local-Dir: {
  label: "本地目錄\n(~/.aigne/<hostname>/...)"
  shape: cylinder
}

User -> CLI: "aigne run <url>"
CLI.Download -> Remote-URL: "1. 取得專案"
Remote-URL -> CLI.Download: "2. 回傳 tarball"
CLI.Download -> Cache-Dir: "3. 儲存 tarball"
CLI.Extract -> Cache-Dir: "4. 讀取 tarball"
CLI.Extract -> Local-Dir: "5. 解壓縮專案檔案"
CLI.Load -> Local-Dir: "6. 載入 aigne.yaml 和 .env"
CLI.Execute -> CLI.Load: "7. 執行 agent"
CLI.Execute -> User: "8. 顯示輸出"
```

## 範例

### 執行本地 Agent

從您本機檔案系統上的專案執行 agent。

```bash 從當前目錄執行 icon=lucide:folder-dot
# 在當前目錄中執行預設 agent
aigne run
```

```bash 執行特定 agent icon=lucide:locate-fixed
# 執行位於特定專案路徑中的 'translator' agent
aigne run path/to/my-project translator
```

### 執行遠端 Agent

您可以直接從 Git 儲存庫或 tarball URL 執行 agent。CLI 會處理下載並將專案快取到您的家目錄 (`~/.aigne`)。

```bash 從 GitHub 儲存庫執行 icon=lucide:github
aigne run https://github.com/AIGNE-io/aigne-framework/tree/main/examples/default
```

### 在互動式聊天模式下執行

對於對話式 agent，請使用 `--chat` 旗標來啟動互動式終端機工作階段。

![在聊天模式下執行 agent](../assets/run/run-default-template-project-in-chat-mode.png)

```bash 啟動聊天工作階段 icon=lucide:messages-square
aigne run --chat
```

在聊天迴圈中，您可以使用 `/exit` 等指令退出，或使用 `/help` 尋求協助。您也可以透過在路徑前加上 `@` 字首，將本地檔案附加到您的訊息中。

```
💬 告訴我關於這個檔案的資訊：@/path/to/my-document.pdf
```

## 為 Agent 提供輸入

根據 `aigne.yaml` 中定義的輸入結構，有多種方式可以為您的 agent 提供輸入。

#### 作為命令列選項

如果 agent 的輸入結構定義了特定參數（例如 `text`、`targetLanguage`），您可以將它們作為命令列選項傳遞。

```bash 傳遞 agent 特定參數 icon=lucide:terminal
# 假設 'translator' agent 有 'text' 和 'targetLanguage' 輸入
aigne run translator --text "Hello, world!" --targetLanguage "Spanish"
```

#### 從標準輸入 (stdin)

您可以將內容直接透過管道傳遞給 `run` 指令。這對於串連指令很有用。

```bash 將輸入透過管道傳遞給 agent icon=lucide:pipe
echo "總結這個重要的更新。" | aigne run summarizer
```

#### 從檔案

使用 `@` 字首從檔案讀取內容並將其作為輸入傳遞。

-   **`--input @<file>`**：讀取整個檔案內容作為主要輸入。
-   **`--<param> @<file>`**：為特定 agent 參數讀取檔案內容。

```bash 從檔案讀取輸入 icon=lucide:file-text
# 使用 document.txt 的內容作為主要輸入
aigne run summarizer --input @document.txt

# 為多個參數提供結構化的 JSON 輸入
aigne run translator --input @request-data.json --format json
```

#### 多媒體檔案輸入

對於處理圖片或文件等檔案的 agent（例如，視覺模型），請使用 `--input-file` 選項。

```bash 為視覺 agent 附加一個檔案 icon=lucide:image-plus
aigne run image-describer --input-file cat.png --input "這張圖片裡有什麼？"
```

## 選項參考

### 一般選項

| 選項 | 說明 |
|---|---|
| `--chat` | 在終端機中以互動式聊天迴圈執行 agent。 |
| `--log-level <level>` | 設定日誌記錄層級。可用層級：`debug`、`info`、`warn`、`error`、`silent`。預設值：`silent`。 |

### 模型選項

這些選項允許您覆蓋 `aigne.yaml` 中定義的模型設定。

| 選項 | 說明 |
|---|---|
| `--model <provider[:model]>` | 指定要使用的 AI 模型（例如 'openai' 或 'openai:gpt-4o-mini'）。 |
| `--temperature <value>` | 模型溫度 (0.0-2.0)。值越高，隨機性越大。 |
| `--top-p <value>` | 模型 top-p / 核心取樣 (0.0-1.0)。控制回應的多樣性。 |
| `--presence-penalty <value>` | 存在懲罰 (-2.0 到 2.0)。懲罰重複的詞元。 |
| `--frequency-penalty <value>` | 頻率懲罰 (-2.0 到 2.0)。懲罰頻繁的詞元。 |
| `--aigne-hub-url <url>` | 用於取得遠端模型或 agent 的自訂 AIGNE Hub 服務 URL。 |

### 輸入與輸出選項

| 選項 | 別名 | 說明 |
|---|---|---|
| `--input <value>` | `-i` | 給 agent 的輸入。可多次指定。使用 `@<file>` 從檔案讀取。 |
| `--input-file <path>` | | 給 agent 的輸入檔案路徑（例如，用於視覺模型）。可多次指定。 |
| `--format <format>` | | 使用 `--input @<file>` 時的輸入格式。可選：`text`、`json`、`yaml`。 |
| `--output <file>` | `-o` | 儲存結果的檔案路徑。預設為列印到標準輸出。 |
| `--output-key <key>` | | agent 結果物件中要儲存到輸出檔案的鍵。預設為 `output`。 |
| `--force` | | 如果輸出檔案已存在則覆寫。如果父目錄不存在則建立。 |

---

## 下一步

<x-cards>
  <x-card data-title="aigne observe" data-icon="lucide:monitor-dot" data-href="/command-reference/observe">
    了解如何啟動可觀測性伺服器，以檢視您 agent 執行的詳細追蹤記錄。
  </x-card>
  <x-card data-title="執行遠端 Agent" data-icon="lucide:cloudy" data-href="/guides/running-remote-agents">
    深入了解直接從遠端 URL 執行 agent 的具體細節。
  </x-card>
  <x-card data-title="建立自訂 Agent" data-icon="lucide:bot" data-href="/guides/creating-a-custom-agent">
    開始建構您自己的 agent 和技能，以便與 AIGNE CLI 一起使用。
  </x-card>
</x-cards>