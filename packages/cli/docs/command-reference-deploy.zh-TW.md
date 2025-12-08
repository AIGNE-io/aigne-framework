---
labels: ["Reference"]
---

# aigne deploy

`aigne deploy` 指令會將您的 AIGNE 應用程式打包並部署為 [Blocklet](https://www.blocklet.dev/)，發佈到指定的 Blocklet Server 端點。這是將您的 Agent 發佈以供生產環境使用的標準方法，使其能作為一個獨立、可執行的服務來存取。

## 用法

```bash 基本用法 icon=mdi:console
aigne deploy --path <path-to-project> --endpoint <deploy-endpoint>
```

## 選項

<x-field data-name="--path" data-type="string" data-required="true" data-desc="指定包含 aigne.yaml 檔案的 AIGNE 專案目錄路徑。"></x-field>

<x-field data-name="--endpoint" data-type="string" data-required="true" data-desc="應用程式將部署到的 Blocklet Server 端點 URL。"></x-field>

## 部署流程

`deploy` 指令會自動化執行幾個步驟，以正確打包您的 Agent 並將其部署到目標環境。對於某個專案的首次執行，此流程是互動式的；對於後續的更新，則是非互動式的。

```d2 部署工作流程
direction: down

Developer: { 
  shape: c4-person 
}

CLI: {
  label: "`aigne deploy`"
  
  task-1: { label: "1. 準備環境" }
  task-2: { label: "2. 檢查 Blocklet CLI" }
  task-3: { label: "3. 設定 Blocklet\n(名稱與 DID)" }
  task-4: { label: "4. 打包專案" }
  task-5: { label: "5. 部署至伺服器" }

  task-1 -> task-2 -> task-3 -> task-4 -> task-5
}

Blocklet-Server: {
  label: "Blocklet Server"
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

Deployed-Blocklet: {
  label: "已部署的 Agent\n(作為 Blocklet)"
}

Developer -> CLI: "以路徑和端點執行指令"
CLI.task-5 -> Blocklet-Server: "上傳打包檔"
Blocklet-Server -> Deployed-Blocklet: "託管 Agent"
```

以下是執行此指令時所發生情況的逐步解析：

1.  **環境準備**：一個暫時的 `.deploy` 目錄會在您的專案根目錄中建立。此指令會將您的 Agent 來源檔案和一個標準的 Blocklet 範本複製到此目錄中，為打包做準備。

2.  **安裝相依套件**：如果存在 `package.json` 檔案，它會在暫時目錄中執行 `npm install`，以取得所有必要的相依套件。

3.  **Blocklet CLI 檢查**：此指令會驗證 `@blocklet/cli` 是否已全域安裝。如果未安裝，系統會提示您自動安裝，因為打包和部署 Blocklet 都需要它。

4.  **設定（首次部署）**：在專案的首次部署時，CLI 將引導您完成一個簡短的互動式設定：
    *   **Blocklet 名稱**：系統會要求您為您的 Blocklet 提供一個名稱。它會根據您 `aigne.yaml` 中的 `name` 欄位或專案的目錄名稱建議一個預設值。
    *   **DID 產生**：系統會使用 `blocklet create --did-only` 為您的 Blocklet 自動產生一個新的去中心化識別碼（DID），賦予其一個獨特、可驗證的身份。
    *   此設定（名稱和 DID）會儲存在本地的 `~/.aigne/deployed.yaml` 中。對於同一專案的後續部署，將自動使用這些已儲存的值，使流程變為非互動式。

5.  **打包**：CLI 會執行 `blocklet bundle --create-release`，將您所有的應用程式檔案打包成一個單一、可部署的成品。

6.  **部署**：最終的打包檔會使用 `blocklet deploy` 上傳到您指定的 `--endpoint`。

7.  **清理**：成功部署後，暫時的 `.deploy` 目錄會被自動移除。

## 範例

若要將位於目前目錄中的 AIGNE 專案部署到您的 Blocklet Server：

```bash 部署專案 icon=mdi:console
aigne deploy --path . --endpoint https://my-node.abtnode.com
```

如果這是您第一次部署此專案，您將會看到一個提示，要求您為您的 Agent Blocklet 命名：

```text 首次部署提示
✔ Prepare deploy environment
✔ Check Blocklet CLI
ℹ Configure Blocklet
? Please input agent blocklet name: › my-awesome-agent
✔ Bundle Blocklet
...
✅ Deploy completed: /path/to/your/project -> https://my-node.abtnode.com
```

若需關於設定部署目標和管理您已部署 Agents 的更詳細演練，請參閱 [部署 Agents](./guides-deploying-agents.md) 指南。