---
labels: ["Reference"]
---

---
labels: ["Reference"]
---

# 總覽

<p align="center">
  <picture>
    <source srcset="../logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="../logo.svg" media="(prefers-color-scheme: light)">
    <img src="../logo.svg" alt="AIGNE 標誌" width="400" />
  </picture>

  <center>您的 Agent 開發指令中心</center>
</p>

`@aigne/cli` 是 [AIGNE 框架](https://github.com/AIGNE-io/aigne-framework) 的官方命令列工具，旨在簡化 Agent 開發的整個生命週期。它提供了一套全面的指令，以簡化專案建立、本地執行、測試和部署，讓您能夠輕鬆地建置、執行和管理 AIGNE 應用程式。

## 主要功能

`@aigne/cli` 搭載了眾多功能，可加速您的 Agent 開發工作流程。

<x-cards data-columns="3">
  <x-card data-title="專案鷹架" data-icon="lucide:folder-plus">
    使用 `aigne create` 指令，以預先定義的檔案結構和設定快速建立新的 AIGNE 專案。
  </x-card>
  <x-card data-title="本地 Agent 執行" data-icon="lucide:play-circle">
    透過 `aigne run` 在本地聊天循環中輕鬆執行您的 Agent 並與之互動，以進行快速測試和偵錯。
  </x-card>
  <x-card data-title="自動化測試" data-icon="lucide:beaker">
    利用內建的 `aigne test` 指令執行單元和整合測試，以確保您的 Agent 穩健可靠。
  </x-card>
  <x-card data-title="MCP 伺服器整合" data-icon="lucide:server">
    將您的 Agent 作為模型情境協定 (MCP) 伺服器啟動，使其能夠與外部系統整合。
  </x-card>
  <x-card data-title="豐富的可觀察性" data-icon="lucide:bar-chart-3">
    使用 `aigne observe` 啟動本地伺服器，以檢視和分析 Agent 的執行追蹤和效能資料。
  </x-card>
  <x-card data-title="多模型支援" data-icon="lucide:bot">
    在不同的 AI 模型供應商之間無縫切換，包括 OpenAI、Claude、XAI 等。
  </x-card>
</x-cards>

## 核心指令一覽

CLI 提供了一組直觀的指令來管理您的 AIGNE 專案。以下是您將會使用的主要指令：

```bash Basic Commands icon=lucide:terminal
# 建立一個新的 AIGNE 專案
aigne create [path]

# 在本地執行 Agent
aigne run --path <agent-path>

# 為您的 Agent 執行自動化測試
aigne test --path <agent-path>

# 將 Agent 作為 MCP 伺服器提供服務
aigne serve-mcp --path <agent-path>

# 啟動可觀察性和監控伺服器
aigne observe
```

這套工具集構成了 AIGNE 開發體驗的基礎，提供了從概念發想到投入生產所需的一切。

---

準備好開始了嗎？請遵循我們的 [入門指南](./getting-started.md) 來安裝 CLI 並建立您的第一個 AIGNE Agent。