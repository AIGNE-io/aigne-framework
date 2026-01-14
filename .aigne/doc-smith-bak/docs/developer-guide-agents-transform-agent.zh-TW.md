# Transform Agent

`TransformAgent` 是一種專門的 agent，提供了一種使用 [JSONata](https://jsonata.org/) 表達式來宣告式轉換結構化資料的方法。它非常適合需要將資料從一種格式對應、重組或轉換為另一種格式，而無需複雜命令式邏輯的場景。

常見用例包括：
- 將 API 回應正規化為一致的格式。
- 在不同資料結構之間對應欄位（例如，將資料庫結果對應到應用程式模型）。
- 重組設定資料。
- 轉換資料格式，例如將欄位名稱從 `snake_case` 改為 `camelCase`。
- 對資料執行簡單的彙總、計算或篩選。

對於需要更複雜、自訂邏輯的轉換，請考慮使用 [Function Agent](./developer-guide-agents-function-agent.md)。

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![Transform Agent](assets/diagram/transform-agent-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 設定

`TransformAgent` 使用以下選項進行設定。

<x-field-group>
  <x-field data-name="jsonata" data-type="string" data-required="true">
    <x-field-desc markdown>
      一個 [JSONata](https://jsonata.org/) 表達式字串，用於定義資料轉換邏輯。JSONata 是一種輕量級的 JSON 資料查詢和轉換語言。該表達式決定了輸入訊息如何轉換為輸出訊息。您可以在 [JSONata Playground](https://try.jsonata.org/) 中試驗各種表達式。

      **常見模式：**
      - **欄位對應：** `{ "newField": oldField }`
      - **陣列轉換：** `items.{ "name": product_name, "price": price }`
      - **計算：** `$sum(items.price)`
      - **條件邏輯：** `condition ? value1 : value2`
      - **字串操作：** `$uppercase(name)`
    </x-field-desc>
  </x-field>
</x-field-group>

## 用法

`TransformAgent` 可以使用 TypeScript 以程式化方式定義，或使用 YAML 以宣告方式定義。

### TypeScript 範例

此範例示範如何建立一個將欄位名稱從 snake_case 轉換為 camelCase 的 `TransformAgent`。

```typescript Transform Agent Example icon=logos:typescript
import { TransformAgent } from "@aigne/core";

// 1. 定義 TransformAgent
const snakeToCamelAgent = TransformAgent.from({
  name: "snake-to-camel-converter",
  description: "Converts user data fields from snake_case to camelCase.",
  jsonata: `{
    "userId": user_id,
    "userName": user_name,
    "createdAt": created_at
  }`,
});

// 2. 定義輸入資料
const inputData = {
  user_id: "usr_12345",
  user_name: "John Doe",
  created_at: "2023-10-27T10:00:00Z",
};

// 3. 呼叫 agent 執行轉換
async function runTransform() {
  const result = await snakeToCamelAgent.invoke(inputData);
  console.log(result);
}

runTransform();
```

該 agent 將 JSONata 表達式應用於 `inputData`，並按照指定重新命名鍵。

**輸出**

```json icon=mdi:code-json
{
  "userId": "usr_12345",
  "userName": "John Doe",
  "createdAt": "2023-10-27T10:00:00Z"
}
```

### YAML 範例

同一個 agent 可以在 YAML 檔案中以宣告方式定義。這對於將 agent 定義為更大型設定的一部分非常有用。

```yaml transform.yaml icon=mdi:language-yaml
type: transform
name: transform-agent
description: |
  A Transform Agent that processes input data using JSONata expressions.
input_schema:
  type: object
  properties:
    user_id:
      type: string
      description: The ID of the user.
    user_name:
      type: string
      description: The name of the user.
    created_at:
      type: string
      description: The creation date of the user.
  required:
    - user_id
    - user_name
    - created_at
output_schema:
  type: object
  properties:
    userId:
      type: string
      description: The ID of the user.
    userName:
      type: string
      description: The name of the user.
    createdAt:
      type: string
      description: The creation date of the user.
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

此 YAML 定義指定了 agent 的類型、名稱、結構描述以及核心的 `jsonata` 轉換表達式，實現了與 TypeScript 範例相同的結果。

## 總結

`TransformAgent` 為處理結構化資料轉換提供了一種強大而簡潔的方法。透過利用 JSONata，它將資料對應和重組邏輯與您的主要應用程式碼分開，從而實現更清晰、更易於維護的 agentic 工作流程。

若要將此 agent 與其他 agent 進行協調，請參閱 [Team Agent](./developer-guide-agents-team-agent.md) 文件。