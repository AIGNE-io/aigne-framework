---
labels: ["Reference"]
---

# aigne observe

`aigne observe` 指令會啟動一個本地 Web 伺服器，用於監控和分析 Agent 執行資料。它提供了一個使用者友善的介面，讓您能檢視追蹤記錄、查看詳細的呼叫資訊，並理解您的 Agent 在執行期間的行為。這個工具對於除錯、效能調校以及深入了解您的 Agent 如何處理資訊並與各種工具和模型互動至關重要。

## 用法

若要啟動可觀測性伺服器，請在您的終端機中執行以下指令：

```bash 用法 icon=lucide:terminal
aigne observe [options]
```

啟動後，CLI 將會印出伺服器 URL 和本地可觀測性資料庫的路徑。

![AIGNE 可觀測性伺服器執行中介面](../assets/observe/observe-running-interface.png)

## 運作方式

`observe` 指令會啟動一個 Web 應用程式，它會從 AIGNE 儲存所有執行追蹤記錄的本地 SQLite 資料庫讀取資料。每當您執行一個 Agent（使用 `aigne run` 或 `aigne serve-mcp`）時，框架會自動記錄執行流程的詳細日誌。這些日誌隨後便可在可觀測性 UI 中進行檢視。

UI 讓您能瀏覽所有已記錄的追蹤列表，並深入探究特定的追蹤記錄，以查看 Agent 操作的逐步分解，包含輸入、輸出、工具呼叫和模型回應。

![在 AIGNE 可觀測性 UI 中查看呼叫詳細資訊](../assets/observe/observe-view-call-details.png)

## 選項

<x-field data-name="--host" data-type="string" data-default="localhost" data-desc="指定伺服器的主機位址。使用 `0.0.0.0` 可將伺服器公開給您本地網路上的其他裝置。"></x-field>
<x-field data-name="--port" data-type="number" data-default="7890" data-desc="設定伺服器監聽的埠號。如果指定的埠無法使用，它將嘗試尋找下一個可用的埠。也可以透過 `PORT` 環境變數來設定。"></x-field>

## 範例

### 在預設埠上啟動伺服器

執行不帶任何選項的指令會使用預設設定啟動伺服器。

```bash 使用預設設定啟動 icon=lucide:play
aigne observe
```

**預期輸出：**

```text 主控台輸出
Observability database path: /path/to/your/project/.aigne/observability.db
Observability server is running at http://localhost:7890
```

然後您可以在網頁瀏覽器中開啟 `http://localhost:7890` 來存取 UI。

### 在特定埠上啟動伺服器

使用 `--port` 選項來指定不同的埠。

```bash 在自訂埠上啟動 icon=lucide:play-circle
aigne observe --port 8080
```

這將在 `http://localhost:8080` 上啟動伺服器（如果 8080 埠已被使用，則會使用下一個可用的埠）。

### 將伺服器公開至您的本地網路

若要允許您網路上的其他裝置存取可觀測性 UI，請將主機設定為 `0.0.0.0`。

```bash 公開伺服器 icon=lucide:globe
aigne observe --host 0.0.0.0
```

伺服器屆時將可透過 `http://<your-local-ip>:7890` 存取。