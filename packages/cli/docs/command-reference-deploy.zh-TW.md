---
labels: ["Reference"]
---

---
labels: ["參考"]
---

# aigne deploy

`aigne deploy` 命令會將您的 AIGNE 應用程式打包並部署為 [Blocklet](https://www.blocklet.dev/) 到指定的 Blocklet Server 端點。這是將您的 agent 發布以供生產使用的標準方法，使其作為一個獨立、可執行的服務來存取。

## 用法

```bash Basic Usage icon=mdi:console
aigne deploy --path <path-to-project> --endpoint <deploy-endpoint>
```

## 選項

<x-field data-name="--path" data-type="string" data-required="true" data-desc="指定包含 aigne.yaml 檔案的 AIGNE 專案目錄路徑。"></x-field>

<x-field data-name="--endpoint" data-type="string" data-required="true" data-desc="應用程式將部署到的 Blocklet Server 端點的 URL。"></x-field>

## 部署流程

`deploy` 命令會自動化幾個步驟，以正確打包您的 agent 並將其部署到目標環境。對於一個給定的專案，首次執行時此流程是互動式的，而後續更新則是非互動式的。

```d2 部署工作流程
direction: down

開發者: { 
  shape: c4-person 
}

CLI: {
  label: "`aigne deploy`"
  
  task-1: { label: "1. 準備環境" }
  task-2: { label: "2. 檢查 Blocklet CLI" }
  task-3: { label: "3. 設定 Blocklet\n(名稱 & DID)" }
  task-4: { label: "4. 捆綁專案" }
  task-5: { label: "5. 部署到伺服器" }

  task-1 -> task-2 -> task-3 -> task-4 -> task-5
}

Blocklet-Server: {
  label: "Blocklet Server"
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

Deployed-Blocklet: {
  label: "已部署的 Agent\n(作為 Blocklet)"
}

開發者 -> CLI: "以路徑和端點執行命令"
CLI.task-5 -> Blocklet-Server: "上傳捆綁包"
Blocklet-Server -> Deployed-Blocklet: "託管 agent"
```

以下是執行此命令時發生的情況的逐步分解：

1.  **環境準備**：會在您的專案根目錄中建立一個暫時的 `.deploy` 目錄。該命令會將您的 agent 的原始檔案和一個標準的 Blocklet 範本複製到此目錄中，以準備打包。

2.  **安裝依賴**：如果存在 `package.json` 檔案，它會在暫時目錄中執行 `npm install` 以獲取所有必要的依賴項。

3.  **Blocklet CLI 檢查**：該命令會驗證 `@blocklet/cli` 是否已全域安裝。如果缺少，系統將提示您自動安裝，因為打包和部署 Blocklets 需要它。

4.  **設定 (首次部署)**：在專案的首次部署時，CLI 將引導您完成一個簡短的互動式設定：
    *   **Blocklet 名稱**：系統會要求您為您的 Blocklet 提供一個名稱。它會根據您 `aigne.yaml` 中的 `name` 欄位或專案的目錄名稱建議一個預設值。
    *   **DID 生成**：系統會使用 `blocklet create --did-only` 為您的 Blocklet 自動生成一個新的去中心化識別碼 (DID)，賦予其一個獨特、可驗證的身份。
    *   此設定（名稱和 DID）會儲存在本地的 `~/.aigne/deployed.yaml` 中。對於同一個專案的後續部署，將自動使用這些儲存的值，使流程變為非互動式。

5.  **捆綁**：CLI 會執行 `blocklet bundle --create-release` 將您所有的應用程式檔案打包成一個可部署的單一成品。

6.  **部署**：最終的捆綁包會使用 `blocklet deploy` 上傳到您指定的 `--endpoint`。

7.  **清理**：成功部署後，暫時的 `.deploy` 目錄會被自動移除。

## 範例

若要將位於目前目錄的 AIGNE 專案部署到您的 Blocklet Server：

```bash Deploying a project icon=mdi:console
aigne deploy --path . --endpoint https://my-node.abtnode.com
```

如果這是您第一次部署此專案，系統將提示您為您的 agent Blocklet 命名：

```text First-time deployment prompt
✔ 準備部署環境
✔ 檢查 Blocklet CLI
ℹ 設定 Blocklet
? 請輸入 agent blocklet 名稱: › my-awesome-agent
✔ 捆綁 Blocklet
...
✅ 部署完成: /path/to/your/project -> https://my-node.abtnode.com
```

有關設定部署目標和管理已部署 agent 的更詳細演練，請參閱 [部署 Agents](./guides-deploying-agents.md) 指南。