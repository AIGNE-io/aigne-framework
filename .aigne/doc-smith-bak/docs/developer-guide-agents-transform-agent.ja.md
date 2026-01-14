# Transform Agent

`TransformAgent` は、[JSONata](https://jsonata.org/) 式を使用して構造化データを宣言的に変換する方法を提供する特殊な Agent です。複雑な命令型ロジックを必要とせずに、データをある形式から別の形式にマッピング、再構築、または変換する必要があるシナリオに最適です。

一般的なユースケースは次のとおりです。
- API 応答を一貫した形式に正規化する。
- 異なるデータスキーマ間でフィールドをマッピングする（例：データベースの結果をアプリケーションモデルに）。
- 構成データを再構築する。
- フィールド名を `snake_case` から `camelCase` に変更するなど、データ形式を変換する。
- データに対して単純な集計、計算、またはフィルタリングを実行する。

より複雑なカスタムロジックを必要とする変換については、[Function Agent](./developer-guide-agents-function-agent.md) の使用を検討してください。

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![Transform Agent](assets/diagram/transform-agent-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 構成

`TransformAgent` は、以下のオプションを使用して構成されます。

<x-field-group>
  <x-field data-name="jsonata" data-type="string" data-required="true">
    <x-field-desc markdown>
      データ変換ロジックを定義する [JSONata](https://jsonata.org/) 式の文字列です。JSONata は、JSON データ用の軽量なクエリおよび変換言語です。この式は、入力メッセージが出力メッセージにどのように変換されるかを決定します。[JSONata Playground](https://try.jsonata.org/) で式を試すことができます。

      **一般的なパターン:**
      - **フィールドマッピング:** `{ "newField": oldField }`
      - **配列変換:** `items.{ "name": product_name, "price": price }`
      - **計算:** `$sum(items.price)`
      - **条件付きロジック:** `condition ? value1 : value2`
      - **文字列操作:** `$uppercase(name)`
    </x-field-desc>
  </x-field>
</x-field-group>

## 使用方法

`TransformAgent` は、TypeScript を使用してプログラムで定義するか、YAML を使用して宣言的に定義することができます。

### TypeScript の例

この例では、フィールド名を snake_case から camelCase に変換する `TransformAgent` を作成する方法を示します。

```typescript Transform Agent Example icon=logos:typescript
import { TransformAgent } from "@aigne/core";

// 1. TransformAgent を定義する
const snakeToCamelAgent = TransformAgent.from({
  name: "snake-to-camel-converter",
  description: "Converts user data fields from snake_case to camelCase.",
  jsonata: `{
    "userId": user_id,
    "userName": user_name,
    "createdAt": created_at
  }`,
});

// 2. 入力データを定義する
const inputData = {
  user_id: "usr_12345",
  user_name: "John Doe",
  created_at: "2023-10-27T10:00:00Z",
};

// 3. Agent を呼び出して変換を実行する
async function runTransform() {
  const result = await snakeToCamelAgent.invoke(inputData);
  console.log(result);
}

runTransform();
```

Agent は JSONata 式を `inputData` に適用し、指定されたとおりにキーの名前を変更します。

**出力**

```json icon=mdi:code-json
{
  "userId": "usr_12345",
  "userName": "John Doe",
  "createdAt": "2023-10-27T10:00:00Z"
}
```

### YAML の例

同じ Agent を YAML ファイルで宣言的に定義することもできます。これは、より大きな構成の一部として Agent を定義する場合に便利です。

```yaml transform.yaml icon=mdi:language-yaml
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

この YAML 定義は、Agent のタイプ、名前、スキーマ、およびコアの `jsonata` 変換式を指定し、TypeScript の例と同じ結果を実現します。

## まとめ

`TransformAgent` は、構造化データ変換を処理するための強力かつ簡潔な方法を提供します。JSONata を活用することで、データマッピングと再構築のロジックをメインのアプリケーションコードから分離し、よりクリーンで保守性の高い Agent ワークフローを実現します。

この Agent を他の Agent と連携させる方法については、[Team Agent](./developer-guide-agents-team-agent.md) のドキュメントを参照してください。