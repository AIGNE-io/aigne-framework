このドキュメントは、JSONata 式を使用してデータ変換を行うために設計された特化型 Agent である `TransformAgent` の使用に関する包括的なガイドです。この Agent を設定して使用し、データ形式の変換、フィールドマッピング、API 応答の正規化などのタスクを実行する方法を学びます。

## 概要

`TransformAgent` は、[JSONata](https://jsonata.org/) 式を使用して入力データを目的の出力形式に変換する特化型 Agent です。複雑なカスタムロジックを記述することなく、構造化データを宣言的かつ強力な方法で操作する手段を提供します。

この Agent は特に次の用途に役立ちます。
-   API 応答の正規化とフィールドマッピング
-   データベースクエリ結果の変換
-   設定データの再構築
-   データ形式の変換 (例: snake_case から camelCase へ)
-   集計および計算操作の実行
-   フィルタリングおよび条件付きデータ処理

## 仕組み

`TransformAgent` は、ユーザー定義の JSONata 式を適用して受信データを処理します。その中心的なロジックは、構造化された入力メッセージを受け取り、式に対して評価し、変換された構造とデータを持つ新しいメッセージを返すことです。

```d2
direction: down

Input-Data: {
  label: "構造化された入力\n(例: API 応答、DB 結果)"
  shape: rectangle
}

TransformAgent: {
  label: "TransformAgent"
  shape: rectangle

  Transformation-Engine: {
    label: "変換エンジン"
    shape: rectangle
  }

  JSONata-Expression: {
    label: "JSONata 式\n(ユーザー定義ロジック)"
    shape: rectangle
    style: {
      stroke: "#888"
      stroke-width: 2
      stroke-dash: 4
    }
  }
}

Output-Data: {
  label: "変換された出力\n(正規化されたデータ)"
  shape: rectangle
}

Input-Data -> TransformAgent.Transformation-Engine: "1. データを受信"
TransformAgent.JSONata-Expression -> TransformAgent.Transformation-Engine: "2. ロジックを適用"
TransformAgent.Transformation-Engine -> Output-Data: "3. 変換されたデータを返す"
```

## 設定

`TransformAgent` を使用するには、YAML ファイルでその設定を定義する必要があります。以下は主要なフィールドです。

| フィールド | タイプ | 説明 |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type` | `string` | Agent のタイプを指定します。`transform` に設定する必要があります。 |
| `name` | `string` | Agent インスタンスの一意の名前。 |
| `description` | `string` | Agent の目的の簡単な説明。 |
| `input_schema` | `object` | JSON スキーマを使用して、期待される入力データの構造を定義します。 |
| `output_schema` | `object` | JSON スキーマを使用して、期待される出力データの構造を定義します。 |
| `jsonata` | `string` | 入力データを出力形式に変換する方法を指定する [JSONata](https://jsonata.org/) 式です。これが Agent のロジックの中核となります。<br><br> **一般的なパターン:**<ul><li>**フィールドマッピング:** `{ "newField": oldField }`</li><li>**配列変換:** `items.{ "name": product_name }`</li><li>**計算:** `$sum(items.price)`</li><li>**条件ロジック:** `condition ? value1 : value2`</li></ul> 詳細については、[公式 JSONata ドキュメント](https://docs.jsonata.org/overview.html) を参照し、[JSONata プレイグラウンド](https://try.jsonata.org/) で試してみてください。 |

## 例

この例では、`TransformAgent` を設定して、ユーザーデータを `snake_case` から `camelCase` に変換する方法を説明します。

### 設定 (`transform.yaml`)

```yaml
type: transform
name: transform-agent
description: |
  JSONata 式を使用して入力データを処理する Transform Agent。
input_schema:
  type: object
  properties:
    user_id:
      type: string
      description: ユーザーの ID。
    user_name:
      type: string
      description: ユーザーの名前。
    created_at:
      type: string
      description: ユーザーの作成日。
  required:
    - user_id
    - user_name
    - created_at
output_schema:
  type: object
  properties:
    userId:
      type: string
      description: ユーザーの ID。
    userName:
      type: string
      description: ユーザーの名前。
    createdAt:
      type: string
      description: ユーザーの作成日。
  required:
    - userId
    - userName
    - createdAt
jsonata: |
  {
    "userId": user_id,
    "userName": user_name,
    "createdAt": created_at
  }
```

### 使用方法

Agent が `input_schema` と一致する入力メッセージを受信すると、`jsonata` 式を適用してデータを変換します。

**入力データ:**

```json
{
  "user_id": "usr_12345",
  "user_name": "John Doe",
  "created_at": "2023-10-27T10:00:00Z"
}
```

**出力データ:**

処理後、Agent は `output_schema` に準拠した以下の出力を生成します。

```json
{
  "userId": "usr_12345",
  "userName": "John Doe",
  "createdAt": "2023-10-27T10:00:00Z"
}
```