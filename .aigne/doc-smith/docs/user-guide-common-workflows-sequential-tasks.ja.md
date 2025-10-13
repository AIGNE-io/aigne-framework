# TeamAgent

## 概要

`TeamAgent` は、他の Agent（「スキル」と呼ばれる）のグループを組織化して複雑なタスクを達成する、特殊な Agent です。マネージャーとして機能し、スキルを持つ Agent 間のワークフローとデータフローを指示します。これにより、各 Agent が特定の専門分野に集中できる、洗練されたマルチステップの AI システムを作成できます。

`TeamAgent` は、いくつかの強力なワークフローパターンをサポートしています。

*   **順次処理**: Agent が次々と実行され、処理パイプラインを形成します。
*   **並列処理**: Agent が同時に実行され、独立して実行できるタスクに役立ちます。
*   **リフレクション**: 「レビュアー」Agent がフィードバックを提供し、出力が特定の基準を満たすまで改良を繰り返す反復プロセスです。
*   **イテレーション**: アイテムのリストに対してバッチ処理を行い、各アイテムに同じワークフローを適用します。

これらのパターンを組み合わせることで、モジュール式でスケーラブル、かつ高性能な AI ソリューションを構築できます。

## 主要な概念

### 処理モード

`TeamAgent` は、`ProcessMode` enum で定義される2つの主要なモードで動作できます。モードは、チーム内の Agent がどのように実行されるかを決定します。

*   `ProcessMode.sequential`: このモードでは、Agent は順番に実行されます。最初の Agent からの出力は、初期入力と結合されて2番目の Agent に渡され、これが繰り返されます。これにより、各ステップが前のステップに基づいて構築されるパイプラインが作成されます。明確な依存関係を持つタスクに最適です。

*   `ProcessMode.parallel`: このモードでは、すべての Agent が同時に実行されます。各 Agent は全く同じ初期入力受け取ります。それぞれの個別の出力は、最終結果を形成するためにマージされます。これは、同時に実行できる独立したサブタスクに効率的です。

## TeamAgent の作成

`TeamAgent` は、`skills`（管理する Agent）のリストと処理 `mode` を提供することで作成します。

### 順次処理

シーケンシャルモードでは、Agent はチェーンを形成します。各 Agent の出力は次の Agent への追加の入力として渡されるため、多段階のワークフローに最適です。

**ユースケース**: テキストを最初に生成し、次に翻訳し、最後にフォーマットをレビューするコンテンツ作成パイプライン。

```typescript
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

// Agent 1: コンテンツを中国語に翻訳
const translatorAgent = AIAgent.from({
  name: "translator",
  inputSchema: z.object({
    content: z.string().describe("The text content to translate"),
  }),
  instructions: "Translate the text to Chinese:\n{{content}}",
  outputKey: "translation",
});

// Agent 2: 翻訳されたテキストを整形
const prettierAgent = AIAgent.from({
  name: "prettier",
  inputSchema: z.object({
    translation: z.string().describe("The translated text"),
  }),
  instructions: "Prettier the following text:\n{{translation}}",
  outputKey: "formatted",
});

// シーケンシャルチームを作成
const sequentialTeam = TeamAgent.from({
  name: "sequential-team",
  mode: ProcessMode.sequential,
  skills: [translatorAgent, prettierAgent],
});
```

このチームが呼び出されると、まず `translatorAgent` が実行されます。その出力 `{ translation: "..." }` は、元の入力とマージされ、`prettierAgent` に渡されます。

### 並列処理

パラレルモードでは、すべての Agent が同じ入力を受け取り、同時に実行されます。それらの出力は収集され、マージされます。これは、同じデータに対して複数の独立した分析が必要なタスクに最適です。

**ユースケース**: 製品説明を分析して、その主要な特徴とターゲットオーディエンスの両方を同時に抽出する。

```typescript
import { AIAgent, ProcessMode, TeamAgent } from "@aigne/core";
import { z } from "zod";

// Agent 1: 製品の特徴を抽出
const featureAnalyzer = AIAgent.from({
  name: "feature-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: "Identify and list the key features of the product.",
  outputKey: "features",
});

// Agent 2: ターゲットオーディエンスを特定
const audienceAnalyzer = AIAgent.from({
  name: "audience-analyzer",
  inputSchema: z.object({
    product: z.string().describe("The product description to analyze"),
  }),
  instructions: "Identify the target audience for this product.",
  outputKey: "audience",
});

// パラレルチームを作成
const analysisTeam = TeamAgent.from({
  name: "analysis-team",
  skills: [featureAnalyzer, audienceAnalyzer],
  mode: ProcessMode.parallel,
});
```

このチームが製品説明とともに呼び出されると、`featureAnalyzer` と `audienceAnalyzer` が同時に実行され、それらの出力は `{ features: "...", audience: "..." }` という単一の結果に結合されます。

## 高度なワークフロー

単純な順次実行および並列実行を超えて、`TeamAgent` はより複雑なシナリオのための高度な機能を提供します。

### リフレクションモード

リフレクションは、反復的な改良ワークフローを可能にします。チームの出力は、指定された `reviewer` Agent によってレビューされます。出力が承認されない場合、プロセスは繰り返され、前の出力とフィードバックが次の試行のコンテキストとして使用されます。このループは、出力が承認されるか、最大反復回数に達するまで続きます。

これは、品質保証、自己修正、および高度な精度を必要とするタスクに役立ちます。

**設定 (`ReflectionMode`)**

<x-field-group>
  <x-field data-name="reviewer" data-type="Agent" data-required="true" data-desc="チームの出力を評価する責任を持つ Agent。"></x-field>
  <x-field data-name="isApproved" data-type="((output: Message) => PromiseOrValue<boolean>) | string" data-required="true" data-desc="結果が承認されたかどうかを判断する、レビュアーの出力内の関数またはフィールド名。文字列の場合、対応するフィールドの真偽値がチェックされます。"></x-field>
  <x-field data-name="maxIterations" data-type="number" data-default="3" data-required="false" data-desc="エラーをスローするまでのレビューサイクルの最大数。"></x-field>
  <x-field data-name="returnLastOnMaxIterations" data-type="boolean" data-default="false" data-required="false" data-desc="true の場合、最大反復回数に達したときにエラーをスローする代わりに、最後に生成された出力を返します。"></x-field>
</x-field-group>

### イテレーターモード

イテレーターモードは、バッチ処理用に設計されています。`iterateOn` オプションで入力フィールドを指定すると、`TeamAgent` はそのフィールドの配列内の各アイテムを反復処理します。チーム全体のワークフローが各アイテムに対して実行されます。

**設定**

<x-field-group>
  <x-field data-name="iterateOn" data-type="keyof I" data-required="true" data-desc="反復対象の配列を含む入力フィールドのキー。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="同時に処理するアイテムの最大数。"></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="true の場合、アイテムの処理からの出力がマージバックされ、配列内の後続のアイテムで利用可能になります。これには、concurrency が 1 である必要があります。"></x-field>
</x-field-group>

## API リファレンス

### TeamAgentOptions

これらは、`TeamAgent.from()` を使用して `TeamAgent` を作成する際に利用可能な設定オプションです。

<x-field-group>
  <x-field data-name="name" data-type="string" data-required="true" data-desc="Agent の一意の名前。"></x-field>
  <x-field data-name="description" data-type="string" data-required="false" data-desc="Agent の目的の説明。"></x-field>
  <x-field data-name="skills" data-type="Agent[]" data-required="true" data-desc="チームを構成する Agent の配列。"></x-field>
  <x-field data-name="mode" data-type="ProcessMode" data-default="ProcessMode.sequential" data-required="false" data-desc="チームの処理モード。「sequential」または「parallel」のいずれか。"></x-field>
  <x-field data-name="reflection" data-type="ReflectionMode" data-required="false" data-desc="反復的なリフレクションワークフローを有効にするための設定。"></x-field>
  <x-field data-name="iterateOn" data-type="keyof I" data-required="false" data-desc="バッチ処理のために反復する入力フィールドキー。"></x-field>
  <x-field data-name="concurrency" data-type="number" data-default="1" data-required="false" data-desc="イテレーターモードの同時実行レベル。"></x-field>
  <x-field data-name="iterateWithPreviousOutput" data-type="boolean" data-default="false" data-required="false" data-desc="バッチ処理中に、ある反復の出力を次の反復にフィードするかどうか。"></x-field>
  <x-field data-name="includeAllStepsOutput" data-type="boolean" data-default="false" data-required="false" data-desc="シーケンシャルモードで true の場合、最終出力には最後のステップだけでなく、すべての中間ステップの出力が含まれます。"></x-field>
</x-field-group>