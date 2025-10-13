本文件為 `TransformAgent` 提供了一份完整的使用指南，`TransformAgent` 是一種專門用於透過 JSONata 表達式進行資料轉換的 Agent。您將學習如何設定和使用此 Agent 來執行資料格式轉換、欄位對應和 API 回應正規化等任務。

## 總覽

`TransformAgent` 是一種專門的 Agent，它使用 [JSONata](https://jsonata.org/) 表達式將輸入資料轉換為所需的輸出格式。它提供了一種宣告式且強大的方式來處理結構化資料操作，而無需編寫複雜的自訂邏輯。

此 Agent 特別適用於：
- API 回應正規化和欄位對應
- 資料庫查詢結果轉換
- 組態資料重組
- 轉換資料格式（例如：snake_case 轉為 camelCase）
- 執行彙總和計算操作
- 篩選和條件式資料處理

## 運作方式

`TransformAgent` 透過應用使用者定義的 JSONata 表達式來處理傳入的資料。其核心邏輯包括接收一個結構化的輸入訊息，根據該表達式對其進行評估，然後回傳一個包含已轉換結構和資料的新訊息。

```d2
direction: down

Input-Data: {
  label: "結構化輸入\n（例如：API 回應、資料庫結果）"
  shape: rectangle
}

TransformAgent: {
  label: "TransformAgent"
  shape: rectangle

  Transformation-Engine: {
    label: "轉換引擎"
    shape: rectangle
  }

  JSONata-Expression: {
    label: "JSONata 表達式\n（使用者定義的邏輯）"
    shape: rectangle
    style: {
      stroke: "#888"
      stroke-width: 2
      stroke-dash: 4
    }
  }
}

Output-Data: {
  label: "轉換後的輸出\n（正規化資料）"
  shape: rectangle
}

Input-Data -> TransformAgent.Transformation-Engine: "1. 接收資料"
TransformAgent.JSONata-Expression -> TransformAgent.Transformation-Engine: "2. 應用邏輯"
TransformAgent.Transformation-Engine -> Output-Data: "3. 回傳轉換後的資料"
```

## 組態

要使用 `TransformAgent`，您需要在一個 YAML 檔案中定義其組態。以下是關鍵欄位：

| Field | Type | Description |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type` | `string` | 指定 Agent 類型。必須設為 `transform`。 |
| `name` | `string` | Agent 實例的唯一名稱。 |
| `description` | `string` | Agent 用途的簡要描述。 |
| `input_schema` | `object` | 使用 JSON Schema 定義預期的輸入資料結構。 |
| `output_schema` | `object` | 使用 JSON Schema 定義預期的輸出資料結構。 |
| `jsonata` | `string` | 一個 [JSONata](https://jsonata.org/) 表達式，用於指定如何將輸入資料轉換為輸出格式。這是該 Agent 的核心邏輯。<br><br> **常見模式：**<ul><li>**欄位對應：** `{ "newField": oldField }`</li><li>**陣列轉換：** `items.{ "name": product_name }`</li><li>**計算：** `$sum(items.price)`</li><li>**條件邏輯：** `condition ? value1 : value2`</li></ul>更多詳細資訊，請參閱 [JSONata 官方文件](https://docs.jsonata.org/overview.html) 並在 [JSONata Playground](https://try.jsonata.org/) 中進行實驗。 |

## 範例

此範例示範如何設定 `TransformAgent` 以將使用者資料從 `snake_case` 轉換為 `camelCase`。

### 組態 (`transform.yaml`)

```yaml
type: transform
name: transform-agent
description: |
  一個使用 JSONata 表達式處理輸入資料的 Transform Agent。
input_schema:
  type: object
  properties:
    user_id:
      type: string
      description: 使用者 ID。
    user_name:
      type: string
      description: 使用者名稱。
    created_at:
      type: string
      description: 使用者的建立日期。
  required:
    - user_id
    - user_name
    - created_at
output_schema:
  type: object
  properties:
    userId:
      type: string
      description: 使用者 ID。
    userName:
      type: string
      description: 使用者名稱。
    createdAt:
      type: string
      description: 使用者的建立日期。
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

### 使用方式

當 Agent 收到與 `input_schema` 相符的輸入訊息時，它會應用 `jsonata` 表達式來轉換資料。

**輸入資料：**

```json
{
  "user_id": "usr_12345",
  "user_name": "John Doe",
  "created_at": "2023-10-27T10:00:00Z"
}
```

**輸出資料：**

處理後，Agent 將產生以下符合 `output_schema` 的輸出：

```json
{
  "userId": "usr_12345",
  "userName": "John Doe",
  "createdAt": "2023-10-27T10:00:00Z"
}
```