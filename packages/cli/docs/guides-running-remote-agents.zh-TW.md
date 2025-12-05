---
labels: ["Reference"]
---

# 執行遠端 Agent

AIGNE CLI 不僅限於執行本地檔案系統中的專案。它還提供了一項強大的功能，可以直接從遠端 URL 執行 Agent。這對於測試、分享和執行 Agent 非常有用，無需克隆儲存庫或手動下載檔案。

本指南將引導您如何從遠端來源執行 Agent，並解釋其底層的快取機制。

## 運作方式

當您向 `aigne run` 命令提供一個 URL 時，CLI 會自動執行以下步驟：

1.  **下載**：它會從提供的 HTTP/HTTPS URL 獲取套件。
2.  **快取**：下載的套件會儲存在本地快取目錄中（預設為 `~/.aigne/`）。這可以加速同一個遠端 Agent 的後續執行，因為如果快取版本已存在，CLI 將會使用它。
3.  **解壓縮**：CLI 會將套件（預計為 tarball）的內容解壓縮到快取中的一個工作目錄。
4.  **執行**：最後，它會從解壓縮的檔案中載入 AIGNE 應用程式，並像執行本地專案一樣執行指定的 Agent。

整個過程都經過簡化，以提供無縫的體驗，讓遠端 Agent 感覺就像本地 Agent 一樣容易存取。

<!-- DIAGRAM_IMAGE_START:flowchart:4:3 -->
![---](assets/diagram/running-remote-agents-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 使用方法

若要執行遠端 Agent，只需將指向 AIGNE 專案的 tarball（`.tar.gz`、`.tgz`）的 URL 傳遞給 `aigne run` 命令即可。

### 基本命令

```bash AIGNE CLI icon=lucide:terminal
# 從遠端 AIGNE 專案執行預設的 Agent
aigne run https://example.com/path/to/your/aigne-project.tar.gz
```

### 執行特定的 Agent

如果遠端專案包含多個 Agent，您可以在 URL 後面加上其名稱來指定要執行哪一個。

```bash AIGNE CLI icon=lucide:terminal
# 從遠端專案執行名為 'my-agent' 的特定 Agent
aigne run https://example.com/path/to/your/aigne-project.tar.gz my-agent
```

您提供的任何額外參數或選項都將直接傳遞給遠端 Agent。

```bash AIGNE CLI icon=lucide:terminal
# 執行帶有額外選項的特定 Agent
aigne run https://example.com/path/to/your/aigne-project.tar.gz my-agent --input "Hello, world!"
```

## 快取

AIGNE CLI 會自動快取下載的遠端 Agent，以避免每次執行時都重新下載。

*   **預設位置**：快取儲存在您家目錄下的 `.aigne` 目錄中（例如 `~/.aigne/`）。快取內的確切路徑由 URL 的主機名稱和路徑決定，以確保不同的遠端 Agent 分開儲存。

*   **覆寫快取目錄**：雖然預設位置適用於大多數情況，但您可以使用 `--cache-dir` 選項指定自訂的快取目錄。這對於 CI/CD 環境或管理不同組的快取 Agent 非常有用。

```bash AIGNE CLI icon=lucide:terminal
# 使用自訂目錄來快取下載的套件
aigne run https://example.com/path/to/your/aigne-project.tar.gz --cache-dir /tmp/aigne-cache
```

這項強大的功能簡化了 AIGNE Agent 的協作和分發。您現在可以繼續學習如何部署您的 Agent 以供生產環境使用。

<x-card data-title="部署 Agent" data-icon="lucide:rocket" data-href="/guides/deploying-agents" data-cta="閱讀指南">
  了解如何將您的 AIGNE 專案部署為 Blocklet 以供生產環境使用。
</x-card>
