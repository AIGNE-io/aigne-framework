# モデル

AIGNEフレームワークはモデルに依存しないように設計されており、さまざまなサードパーティのAIモデルプロバイダーに接続できます。この柔軟性は、モデルアダプターのシステムによって実現されます。各アダプターは、OpenAI、Anthropic、Google Geminiなどの特定のサービスに対して標準化されたインターフェースを提供します。

このセクションでは、公式にサポートされている各モデルプロバイダーのインストール、設定、および使用に関する詳細なガイドを提供します。強力な言語モデル、特殊な画像およびビデオ生成、またはローカルでホストされるモデルのプライバシーが必要な場合でも、ここで適切な統合を見つけることができます。

## サポートされているモデルプロバイダー

以下は、サポートされているプロバイダーの厳選されたリストです。各カードは、インストール手順、設定の詳細、および実践的なコード例を含む専用のガイドにリンクしています。

### 基盤モデル

これらは、チャット補完やその他の言語ベースのタスクのために、主要なAIモデルプロバイダーと直接統合するものです。

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    強力なGPT-4oを含むOpenAIのモデルスイートと統合し、チャット補完や関数呼び出しを実現します。
  </x-card>
  <x-card data-title="Anthropic" data-icon="simple-icons:anthropic" data-href="/models/anthropic">
    複雑な推論や会話で高いパフォーマンスを発揮することで知られるAnthropicのClaudeモデルを活用します。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    GoogleのGeminiファミリーのマルチモーダルモデルに接続し、高度なテキストおよび画像理解を実現します。
  </x-card>
  <x-card data-title="AWS Bedrock" data-icon="simple-icons:amazonaws" data-href="/models/bedrock">
    AWS Bedrockを通じて、Anthropic、Cohere、Amazonなどのプロバイダーからのさまざまな基盤モデルにアクセスします。
  </x-card>
  <x-card data-title="DeepSeek" data-icon="lucide:brain-circuit" data-href="/models/deepseek">
    DeepSeekの強力で効率的な言語モデルを利用して、さまざまな自然言語処理タスクを実行します。
  </x-card>
  <x-card data-title="Doubao" data-icon="lucide:bot" data-href="/models/doubao">
    Doubaoの言語モデルと統合し、会話型AIやその他のテキストベースのアプリケーションを構築します。
  </x-card>
  <x-card data-title="xAI" data-icon="lucide:sparkles" data-href="/models/xai">
    xAIのGrokモデルに接続し、リアルタイムの情報処理とユニークな会話スタイルを実現します。
  </x-card>
</x-cards>

### 画像生成モデル

テキストプロンプトから視覚コンテンツを作成するための専用の統合です。

<x-cards data-columns="2">
  <x-card data-title="Ideogram" data-icon="lucide:image" data-href="/models/ideogram">
    Ideogramの高度な合成モデルを使用して、信頼性の高いテキストレンダリングを備えた高品質の画像を生成します。
  </x-card>
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
    DALL-E 3やその他のモデルを使用して、創造的で多様な画像生成機能を実現します。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    GeminiとImagenモデルを活用して、言語機能と並行して多目的な画像生成と編集を行います。
  </x-card>
</x-cards>

### 動画生成モデル

テキストまたは画像入力から動画コンテンツを生成するための統合です。

<x-cards data-columns="2">
  <x-card data-title="OpenAI" data-icon="simple-icons:openai" data-href="/models/openai">
     OpenAIのSoraモデルを使用して、テキストまたは画像のプロンプトから高品質の動画コンテンツを生成します。
  </x-card>
  <x-card data-title="Google Gemini" data-icon="simple-icons:googlegemini" data-href="/models/gemini">
    GoogleのVeoモデルを使用して、テキストまたは画像から動画を作成し、動的なコンテンツ生成を実現します。
  </x-card>
    <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    OpenAI SoraやGoogle Veoなどの動画生成モデルに、統一されたAPIエンドポイント経由でアクセスします。
  </x-card>
</x-cards>

### ローカルおよびアグリゲーターサービス

単一のAPIを介して複数のモデルへのアクセスを提供するローカルインスタンスまたはサービスに接続します。

<x-cards data-columns="2">
  <x-card data-title="Ollama" data-icon="lucide:server" data-href="/models/ollama">
    Llama 3などのオープンソースモデルを独自のハードウェア上でローカルに実行し、最大限のプライバシーとオフラインアクセスを実現します。
  </x-card>
  <x-card data-title="LMStudio" data-icon="lucide:laptop" data-href="/models/lmstudio">
    LMStudioアプリケーションを介してローカルで実行されているモデルに接続し、オープンソースAIを簡単に実験する方法を提供します。
  </x-card>
  <x-card data-title="OpenRouter" data-icon="lucide:route" data-href="/models/open-router">
    フォールバックオプションを備えた単一の統一されたAPIを介して、さまざまなプロバイダーからの多種多様なモデルにアクセスします。
  </x-card>
  <x-card data-title="Poe" data-icon="lucide:message-square-plus" data-href="/models/poe">
    Poeプラットフォームで利用可能なさまざまなモデルと統合し、多様なAI機能を提供します。
  </x-card>
  <x-card data-title="AIGNE Hub" data-icon="lucide:hub" data-href="/models/aigne-hub">
    AIGNE Hubを統一プロキシとして使用し、クライアント側のコードを変更することなく、複数のLLMプロバイダー間をシームレスに切り替えます。
  </x-card>
</x-cards>

## まとめ

AIGNEフレームワークのモジュラー設計により、特定のニーズに最適なAIモデルと簡単に統合できます。各プロバイダーには、基盤となるAPIの複雑さを処理する専用のパッケージがあり、一貫性のある簡単なインターフェースを提供します。

開始するには、上記のリストからプロバイダーを選択し、リンク先のガイドに従って詳細な手順を確認してください。フレームワーク内でモデルアダプターがどのように機能するかの概要については、[概要](./models-overview.md)ページを参照してください。