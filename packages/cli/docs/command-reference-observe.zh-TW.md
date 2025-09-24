---
labels: ["Reference"]
---

---
labels: ["參考"]
---

# aigne observe

`aigne observe` 命令會啟動一個本地網頁伺服器，用於監控和分析 Agent 的執行資料。它提供一個使用者友善的介面，可用於檢視追蹤、查看詳細的呼叫資訊，並了解您的 Agent 在執行期間的行為。此工具對於偵錯、效能調整，以及深入洞察您的 Agent 如何處理資訊並與各種工具和模型互動至關重要。

## 使用方法

若要啟動可觀測性伺服器，請在您的終端機中執行以下命令：

```bash Usage icon=lucide:terminal
aigne observe [options]
```

啟動後，CLI 將會印出伺服器 URL 和本地可觀測性資料庫的路徑。

![AIGNE 可觀測性伺服器執行介面](../assets/observe/observe-running-interface.png)

## 運作方式

`observe` 命令會啟動一個網頁應用程式，該應用程式會從 AIGNE 儲存所有執行追蹤的本地 SQLite 資料庫讀取資料。每次您執行 Agent（使用 `aigne run` 或 `aigne serve-mcp`）時，框架會自動記錄詳細的執行流程日誌。這些日誌隨後便可在可觀測性 UI 中進行檢視。

該 UI 可讓您瀏覽所有已記錄的追蹤列表，並深入查看特定追蹤，以了解 Agent 操作的逐步分解，包括輸入、輸出、工具呼叫和模型回應。

![在 AIGNE 可觀測性 UI 中查看呼叫詳細資訊](../assets/observe/observe-view-call-details.png)

## 選項

<x-field data-name="--host" data-type="string" data-default="localhost" data-desc="指定伺服器的主機位址。使用 `0.0.0.0` 可將伺服器開放給您本地網路上的其他裝置存取。"></x-field>
<x-field data-name="--port" data-type="number" data-default="7890" data-desc="設定伺服器監聽的埠號。如果指定的埠號無法使用，它將會嘗試尋找下一個可用的埠號。也可以透過 `PORT` 環境變數來設定。"></x-field>

## 範例

### 在預設埠號上啟動伺服器

不帶任何選項執行此命令，將會以預設設定啟動伺服器。

```bash Start with default settings icon=lucide:play
aigne observe
```

**預期輸出：**

```text Console Output
可觀測性資料庫路徑：/path/to/your/project/.aigne/observability.db
可觀測性伺服器正在 http://localhost:7890 執行
```

然後，您可以在網頁瀏覽器中開啟 `http://localhost:7890` 來存取 UI。

### 在特定埠號上啟動伺服器

使用 `--port` 選項來指定不同的埠號。

```bash Start on a custom port icon=lucide:play-circle
aigne observe --port 8080
```

這將會在 `http://localhost:8080` 上啟動伺服器（如果 8080 已被使用，則會使用下一個可用的埠號）。

### 將伺服器開放給您的本地網路

若要允許您網路上的其他裝置存取可觀測性 UI，請將主機設定為 `0.0.0.0`。

```bash Expose the server publicly icon=lucide:globe
aigne observe --host 0.0.0.0
```

伺服器屆時將可透過 `http://<your-local-ip>:7890` 存取。
