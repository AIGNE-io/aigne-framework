---
labels: ["Reference"]
---

# aigne create

`aigne create` 命令會從範本搭建一個新的 AIGNE 專案。它會設定必要的目錄結構和設定檔，讓您能立即開始開發您的 agent。

## 用法

```bash 基本用法 icon=lucide:terminal
aigne create [path]
```

## 引數

<x-field data-name="path" data-type="string" data-default="." data-required="false" data-desc="新專案目錄將被建立的路徑。如果省略，預設為當前目錄，並會觸發互動模式提示輸入專案名稱。"></x-field>

## 互動模式

如果您執行 `aigne create` 時未指定路徑，或使用 `.` 代表當前目錄，CLI 將進入互動模式引導您完成設定過程。系統將提示您輸入以下資訊：

*   **專案名稱**：您的新專案目錄的名稱。
*   **範本**：要使用的專案範本。目前僅提供一個 `default` 範本。

![專案名稱的互動式提示](../assets/create/create-project-interactive-project-name-prompt.png)

### 覆寫確認

為安全起見，如果目標目錄已存在且非空，CLI 在繼續移除其內容前會請求您的確認。如果您選擇不繼續，操作將被安全地取消。

```text 確認提示
? The directory "/path/to/my-aigne-project" is not empty. Do you want to remove its contents? (y/N)
```

## 範例

### 以互動方式建立專案

若要透過引導完成建立過程，請在不帶任何引數的情況下執行此命令。CLI 將提示您輸入專案名稱。

```bash 在當前目錄中建立 icon=lucide:terminal
aigne create
```

### 在特定目錄中建立專案

若要在名為 `my-awesome-agent` 的新目錄中建立專案，請將該名稱作為引數提供。

```bash 在新的 'my-awesome-agent' 目錄中建立 icon=lucide:terminal
aigne create my-awesome-agent
```

此命令會建立 `my-awesome-agent` 目錄並在其中搭建專案。系統仍會提示您選擇範本。

## 成功輸出

成功建立後，您將看到一則確認訊息以及執行新 agent 的後續步驟說明。

![專案建立成功訊息](../assets/create/create-project-using-default-template-success-message.png)

---

建立專案後，下一步是執行您的 agent。更多詳情，請參閱 [`aigne run`](./command-reference-run.md) 命令參考。
