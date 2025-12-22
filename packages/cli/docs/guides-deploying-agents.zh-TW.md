---
labels: ["Reference"]
---

# 部署 Agent

部署您的 AIGNE 專案會將其從本地開發設定轉變為一個稱為 Blocklet 的獨立、可分發的應用程式。這讓您的 Agent 能夠在生產環境中運行、與他人分享，並無縫整合到更廣泛的 Blocklet 生態系統中。`aigne deploy` 指令會自動化整個打包和部署過程。

本指南將引導您完成部署工作流程。關於所有可用指令選項的詳細說明，請參閱 [`aigne deploy` 指令參考](./command-reference-deploy.md)。

## 部署過程

`aigne deploy` 指令會協調一系列步驟來準備、設定、打包及部署您的 Agent。它在底層利用 `@blocklet/cli` 來處理 Blocklet 創建的複雜性。

以下是部署流程的高階概覽：

<!-- DIAGRAM_IMAGE_START:guide:4:3 -->
![---](assets/diagram/deploying-agents-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

### 逐步解說

要部署您的專案，請導航至專案的根目錄並執行部署指令，指定您的專案路徑和目標端點。

```bash 指令 icon=lucide:terminal
aigne deploy --path . --endpoint <your-endpoint-url>
```

讓我們來分解執行此指令時會發生什麼：

1.  **環境準備**：CLI 首先會建立一個暫存的 `.deploy` 目錄。它會將您的專案檔案與標準的 Blocklet 範本一同複製到該目錄中。然後它會在此目錄內執行 `npm install` 來獲取任何必要的依賴項。

2.  **Blocklet CLI 檢查**：此過程會驗證您的系統上是否已安裝 `@blocklet/cli`。如果未安裝，它會提示您授權全域安裝。這是一次性的設定。

    ```
    ? Install Blocklet CLI? ›
    ❯ yes
      no
    ```

3.  **Blocklet 設定（首次部署）**：如果這是您第一次部署此專案，CLI 會要求您為您的 Blocklet 提供一個名稱。它會根據您在 `aigne.yaml` 中的 Agent 名稱或專案的資料夾名稱建議一個預設值。

    ```
    ? Please input agent blocklet name: › my-awesome-agent
    ```

    在您提供名稱後，它會自動為您的 Blocklet 產生一個新的去中心化識別碼（DID）。這個名稱和 DID 會被本地儲存在 `~/.aigne/deployed.yaml` 中，因此在後續部署同一個專案時，您不會再被提示輸入。

4.  **打包**：CLI 接著會調用 `blocklet bundle --create-release`，這個指令會將您的 Agent、其依賴項以及所有必要的設定打包成一個單一、可部署的 `.blocklet/bundle` 檔案。

5.  **部署**：最後，打包好的應用程式會被推送到您指定的 `--endpoint`，這是透過 `blocklet deploy` 指令完成的。

一旦過程完成，您會在終端機中看到一條確認訊息。

```
✅ Deploy completed: /path/to/your/project -> <your-endpoint-url>
```

您的 AIGNE Agent 現在已作為一個 Blocklet 上線，準備好在生產環境中運行。