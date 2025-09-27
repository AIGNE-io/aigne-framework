---
labels: ["Reference"]
---

---
labels: ["Reference"]
---

# 部署 Agent

部署您的 AIGNE 專案，會將其從本地開發環境轉變為一個稱為 Blocklet 的獨立、可分發的應用程式。這讓您的 agent 能夠在生產環境中運行、與他人分享，並無縫地整合到更廣泛的 Blocklet 生態系統中。`aigne deploy` 指令會自動化整個打包與部署流程。

本指南將引導您完成部署的工作流程。有關所有可用指令選項的詳細說明，請參閱 [`aigne deploy` 指令參考](./command-reference-deploy.md)。

## 部署流程

`aigne deploy` 指令會協調一系列步驟，來準備、設定、打包並部署您的 agent。它在底層利用 `@blocklet/cli` 來處理創建 Blocklet 的複雜性。

以下是部署流程的概覽：

```d2
direction: down

開發者: {
  shape: c4-person
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Blocklet-CLI: {
  label: "Blocklet CLI"
}

部署端點: {
  label: "Deployment Endpoint"
  shape: cylinder
}

您的-AIGNE-專案: {
  label: "Your AIGNE Project"
  shape: rectangle
  aigne-yaml: {
    label: "aigne.yaml"
  }
  原始碼: {
    label: "Source Code"
  }
}

開發者 -> AIGNE-CLI: "1. 執行 `aigne deploy`"
AIGNE-CLI -> 您的-AIGNE-專案.aigne-yaml: "2. 讀取專案設定"
AIGNE-CLI -> AIGNE-CLI: "3. 準備暫存的 .deploy 目錄"
AIGNE-CLI -> Blocklet-CLI: "4. 檢查 CLI / 提示安裝"
AIGNE-CLI -> 開發者: "5. 提示輸入 Blocklet 名稱"
開發者 -> AIGNE-CLI: "6. 提供名稱"
AIGNE-CLI -> Blocklet-CLI: "7. 創建 Blocklet DID"
Blocklet-CLI -> AIGNE-CLI: "8. 回傳 DID"
AIGNE-CLI -> AIGNE-CLI: "9. 設定 blocklet.yml"
AIGNE-CLI -> Blocklet-CLI: "10. 打包專案"
Blocklet-CLI -> 部署端點: "11. 部署打包檔"
AIGNE-CLI -> 開發者: "12. 顯示成功訊息"

```

### 步驟詳解

若要部署您的專案，請前往專案的根目錄並執行部署指令，指定專案的路徑與目標端點。

```bash Command icon=lucide:terminal
aigne deploy --path . --endpoint <your-endpoint-url>
```

讓我們來分解執行此指令時會發生什麼事：

1.  **環境準備**：CLI 首先會建立一個暫存的 `.deploy` 目錄。它會將您的專案檔案與一個標準的 Blocklet 範本一同複製到該目錄中。然後，它會在這個目錄內執行 `npm install` 來取得所有必要的依賴套件。

2.  **Blocklet CLI 檢查**：此流程會驗證您的系統上是否已安裝 `@blocklet/cli`。如果尚未安裝，它將提示您授權進行全域安裝。這是一次性的設定。

    ```
    ? Install Blocklet CLI? ›
    ❯ yes
      no
    ```

3.  **Blocklet 設定（首次部署）**：如果這是您第一次部署此專案，CLI 將會詢問您 Blocklet 的名稱。它會根據您在 `aigne.yaml` 中的 agent 名稱或專案的資料夾名稱來建議一個預設名稱。

    ```
    ? Please input agent blocklet name: › my-awesome-agent
    ```

    在您提供名稱後，它會自動為您的 Blocklet 產生一個新的去中心化識別碼 (Decentralized Identifier, DID)。這個名稱和 DID 會被儲存在本地的 `~/.aigne/deployed.yaml` 檔案中，因此在後續部署同一個專案時，您不會再被提示輸入。

4.  **打包**：接著，CLI 會調用 `blocklet bundle --create-release`，這個指令會將您的 agent、其依賴套件以及所有必要的設定打包成一個單一、可部署的 `.blocklet/bundle` 檔案。

5.  **部署**：最後，打包好的應用程式會使用 `blocklet deploy` 指令被推送到您指定的 `--endpoint`。

流程完成後，您會在終端機中看到一則確認訊息。

```
✅ Deploy completed: /path/to/your/project -> <your-endpoint-url>
```

您的 AIGNE agent 現在已作為一個 Blocklet 上線，準備好在生產環境中運行。
