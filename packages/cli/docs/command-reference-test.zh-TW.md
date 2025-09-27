---
labels: ["Reference"]
---

---
labels: ["Reference"]
---

# aigne test

`aigne test` 指令為您的 agents 和技能執行自動化測試。它提供了一個內建的單元和整合測試機制，以確保您的 agents 及其所依賴的工具在部署前能正常運作。

## 用法

```bash Basic Syntax icon=lucide:terminal
aigne test [path]
```

## 參數

| Argument      | Description                                                                                                |
|---------------|------------------------------------------------------------------------------------------------------------|
| `[path]`      | 可選。包含您的 agents 及其對應測試檔案的目錄路徑。如果省略，該指令會在當前目錄中搜尋測試。 |

## 說明

該指令會自動發現並執行您專案中的測試檔案。例如，預設的 AIGNE 專案範本包含一個 `sandbox.test.js` 檔案，用於驗證 `sandbox.js` 技能的功能。`aigne test` 指令將執行這些檔案以驗證您 agent 的能力。

## 範例

### 在當前目錄中執行測試

若要為位於您當前工作目錄中的 AIGNE 專案執行測試案例，請執行不帶任何參數的指令：

```bash icon=lucide:terminal
aigne test
```

### 在特定目錄中執行測試

如果您的 agents 位於不同的目錄，您可以指定該目錄的路徑：

```bash icon=lucide:terminal
aigne test path/to/agents
```

---

## 後續步驟

在確保您的 agents 通過所有測試後，您可以繼續提供它們用於整合，或將它們部署為服務。

<x-cards>
  <x-card data-title="aigne serve-mcp" data-icon="lucide:server" data-href="/command-reference/serve-mcp">
    了解如何將您的 agents 作為 MCP 伺服器提供，以進行外部整合。
  </x-card>
  <x-card data-title="aigne deploy" data-icon="lucide:rocket" data-href="/command-reference/deploy">
    了解如何將您的 AIGNE 應用程式部署為 Blocklet。
  </x-card>
</x-cards>