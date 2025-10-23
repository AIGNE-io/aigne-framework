# 進階主題

在您掌握核心概念並建構了基礎應用程式後，就可以開始探索 AIGNE 框架更精密的功能。本節專為尋求建構複雜、穩健且高度客製化 AI 應用程式的開發者而設計。在此，我們將深入探討進階模式與工具，讓您能更好地控制 Agent 的定義、提示工程、執行生命週期以及資料處理。

以下主題提供了利用這些進階功能的深入指南。理解這些主題將使您能夠從簡單的 Agent 工作流程，進階到建構企業級 AI 系統。

<x-cards data-columns="2">
  <x-card data-title="使用 YAML 定義 Agent" data-icon="lucide:file-code" data-href="/developer-guide/advanced-topics/defining-agents-with-yaml">
    學習如何使用 YAML 檔案以宣告方式定義和設定 Agent。這種方法將設定與程式碼分離，讓您的 Agent 系統更易於管理、版本控制和部署。
  </x-card>
  <x-card data-title="提示" data-icon="lucide:terminal" data-href="/developer-guide/advanced-topics/prompts">
    透過 PromptBuilder 深入了解動態提示管理。本指南涵蓋如何使用 Nunjucks 範本為您的 AI 模型建立彈性、可重複使用且具備情境感知能力的提示。
  </x-card>
  <x-card data-title="掛鉤" data-icon="lucide:git-pull-request" data-href="/developer-guide/advanced-topics/hooks">
    了解 Agent 的執行生命週期以及如何使用掛鉤進行攔截。學習在 onStart、onEnd 和 onSkillStart 等不同階段新增自訂邏輯、日誌記錄或監控。
  </x-card>
  <x-card data-title="串流" data-icon="lucide:fast-forward" data-href="/developer-guide/advanced-topics/streaming">
    探索如何處理來自 Agent 的即時串流回應。這對於建立反應靈敏、能在資訊可用時立即傳遞的對話式應用程式至關重要。
  </x-card>
</x-cards>

## 總結

本節提供了提升您 AI 應用程式所需的工具與技術。透過利用宣告式定義、動態提示、生命週期掛鉤和串流，您可以建構更強大、可維護且高效率的 Agent 系統。

如需更多詳細資訊，請前往上方連結的特定子章節。若要了解這些元件如何融入更廣泛的架構中，請參閱 [核心概念](./developer-guide-core-concepts.md) 文件。