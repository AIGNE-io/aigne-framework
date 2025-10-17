---
labels: ["Reference"]
---

# aigne create

`aigne create` 指令會從範本建立一個新的 AIGNE 專案。它會設定必要的目錄結構和設定檔，讓您可以立即開始開發您的 Agent。

## 用法

```bash 基本用法 icon=lucide:terminal
aigne create [path]
```

## 參數

<x-field data-name="path" data-type="string" data-default="." data-required="false" data-desc="將建立新專案目錄的路徑。如果省略，預設為當前目錄，並會觸發互動模式提示您輸入專案名稱。"></x-field>

## 互動模式

如果您執行 `aigne create` 時未指定路徑，或使用 `.` 代表當前目錄，CLI 將進入互動模式引導您完成設定過程。系統會提示您輸入以下資訊：

*   **專案名稱**：新專案目錄的名稱。
*   **範本**：要使用的專案範本。目前僅提供 `default` 範本。

![Interactive prompt for project name](../assets/create/create-project-interactive-project-name-prompt.png)

### 覆寫確認

為安全起見，如果目標目錄已存在且非空，CLI 在移除其內容前會請求您的確認。如果您選擇不繼續，操作將被安全取消。

```text 確認提示
? 目錄 "/path/to/my-aigne-project" 不是空的。您想移除其內容嗎？ (y/N)
```

## 範例

### 以互動方式建立專案

若要透過引導完成建立過程，請執行不含任何參數的指令。CLI 會提示您輸入專案名稱。

```bash 在當前目錄中建立 icon=lucide:terminal
aigne create
```

### 在特定目錄中建立專案

若要在名為 `my-awesome-agent` 的新目錄中建立專案，請將該名稱作為參數提供。

```bash 在新的 'my-awesome-agent' 目錄中建立 icon=lucide:terminal
aigne create my-awesome-agent
```

此指令會建立 `my-awesome-agent` 目錄並在其中建立專案。您仍然會被提示選擇範本。

## 成功輸出

成功建立後，您將會看到一則確認訊息以及執行新 Agent 的後續步驟說明。

![Project creation success message](../assets/create/create-project-using-default-template-success-message.png)

---

建立專案後，下一步是執行您的 Agent。欲了解更多詳情，請參閱 [`aigne run`](./command-reference-run.md) 指令參考。
