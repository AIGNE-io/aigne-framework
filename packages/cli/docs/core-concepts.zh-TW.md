---
labels: ["Reference"]
---

---
labels: ["Reference"]
---

# 核心概念

一個 AIGNE 專案提供了一個用於開發、測試和部署 AI agent 的結構化環境。專案的核心是一個目錄，其中包含定義您的 agent、它們可以使用的技能以及它們所連接的語言模型的設定檔。本節將詳細介紹這些基本組成部分。

## 專案結構

當您使用 `aigne create` 建立新專案時，它會搭建一個標準的目錄結構，以保持您的元件井然有序。一個典型的專案看起來像這樣：

```text 專案結構 icon=mdi:folder-open
my-agent-project/
├── aigne.yaml        # 主要的專案設定檔。
├── agents/           # 用於存放 agent 定義檔的目錄。
│   └── chat.yaml     # 範例 agent 定義。
└── skills/           # 用於存放技能實作檔的目錄。
    └── sandbox.js    # 範例技能實作。
```

這種結構將設定（`aigne.yaml`、`agents/`）與實作（`skills/`）分開，使您的專案模組化且易於管理。

## 各個部分如何協同工作

下圖說明了 AIGNE 專案核心元件之間的關係。中心的 `aigne.yaml` 檔案協調所有部分，定義了存在哪些 agent、它們可以使用哪些技能，以及哪個 AI 模型為它們的智能提供支援。

```d2
direction: down

aigne-yaml: {
  label: "aigne.yaml"
  shape: rectangle
}

agent: {
  label: "Agent\n(e.g., chat.yaml)"
  shape: rectangle
}

skill: {
  label: "Skill\n(e.g., sandbox.js)"
  shape: rectangle
}

chat-model: {
  label: "Chat Model\n(e.g., gpt-4o-mini)"
  shape: cylinder
}

aigne-yaml -> agent: "Defines"
aigne-yaml -> skill: "Registers"
aigne-yaml -> chat-model: "Configures"
agent -> skill: "Uses"
agent -> chat-model: "Communicates with"
```

要了解 AIGNE 專案如何運作，必須掌握其兩個主要元件：中央專案設定以及可執行的 agent 和技能。下面將更詳細地探討它們。

<x-cards>
  <x-card data-title="專案設定 (aigne.yaml)" data-icon="lucide:file-cog" data-href="/core-concepts/project-configuration">
    這是您專案的主要清單檔案。它定義了要使用的聊天模型，列出了可用的 agent，並註冊了這些 agent 可以存取的技能。
  </x-card>
  <x-card data-title="Agent 與技能" data-icon="lucide:bot" data-href="/core-concepts/agents-and-skills">
    Agent 是執行任務的核心角色，由其指令和能力定義。技能是 agent 使用的工具，實作為提供特定功能的函式（例如，JavaScript 模組）。
  </x-card>
</x-cards>

---

有了這個基礎了解，您就可以更深入地研究如何設定您的專案了。

**下一步**：在 [專案設定 (aigne.yaml)](./core-concepts-project-configuration.md) 指南中了解更多關於主要設定檔的資訊。