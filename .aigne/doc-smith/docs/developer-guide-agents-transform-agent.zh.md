本文档为 `TransformAgent` 的使用提供了全面的指南，`TransformAgent` 是一个专门用于通过 JSONata 表达式进行数据转换的 Agent。您将学习如何配置和使用此 Agent 来执行数据格式转换、字段映射和 API 响应规范化等任务。

## 概述

`TransformAgent` 是一个专门的 Agent，它使用 [JSONata](https://jsonata.org/) 表达式将输入数据转换为所需的输出格式。它提供了一种声明式且强大的方式来处理结构化数据操作，而无需编写复杂的自定义逻辑。

此 Agent 特别适用于：
-   API 响应规范化和字段映射
-   数据库查询结果转换
-   配置数据重构
-   转换数据格式（例如，snake_case 到 camelCase）
-   执行聚合和计算操作
-   筛选和条件数据处理

## 工作原理

`TransformAgent` 通过应用用户定义的 JSONata 表达式来处理传入的数据。其核心逻辑是接收一个结构化的输入消息，根据表达式对其进行评估，并返回一个包含转换后结构和数据的新消息。

```d2
direction: down

Input-Data: {
  label: "结构化输入\n（例如，API 响应、数据库结果）"
  shape: rectangle
}

TransformAgent: {
  label: "TransformAgent"
  shape: rectangle

  Transformation-Engine: {
    label: "转换引擎"
    shape: rectangle
  }

  JSONata-Expression: {
    label: "JSONata 表达式\n（用户定义的逻辑）"
    shape: rectangle
    style: {
      stroke: "#888"
      stroke-width: 2
      stroke-dash: 4
    }
  }
}

Output-Data: {
  label: "转换后的输出\n（规范化数据）"
  shape: rectangle
}

Input-Data -> TransformAgent.Transformation-Engine: "1. 接收数据"
TransformAgent.JSONata-Expression -> TransformAgent.Transformation-Engine: "2. 应用逻辑"
TransformAgent.Transformation-Engine -> Output-Data: "3. 返回转换后的数据"
```

## 配置

要使用 `TransformAgent`，您需要在 YAML 文件中定义其配置。以下是关键字段：

| 字段 | 类型 | 描述 |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type` | `string` | 指定 Agent 类型。必须设置为 `transform`。 |
| `name` | `string` | Agent 实例的唯一名称。 |
| `description` | `string` | 关于 Agent 用途的简要描述。 |
| `input_schema` | `object` | 使用 JSON Schema 定义输入数据的预期结构。 |
| `output_schema` | `object` | 使用 JSON Schema 定义输出数据的预期结构。 |
| `jsonata` | `string` | 一个 [JSONata](https://jsonata.org/) 表达式，用于指定如何将输入数据转换为输出格式。这是该 Agent 的核心逻辑。 <br><br> **常用模式：**<ul><li>**字段映射：** `{ "newField": oldField }`</li><li>**数组转换：** `items.{ "name": product_name }`</li><li>**计算：** `$sum(items.price)`</li><li>**条件逻辑：** `condition ? value1 : value2`</li></ul> 更多详情，请参阅 [JSONata 官方文档](https://docs.jsonata.org/overview.html) 并在 [JSONata Playground](https://try.jsonata.org/) 中进行实验。 |

## 示例

此示例演示如何配置一个 `TransformAgent`，将用户数据从 `snake_case` 转换为 `camelCase`。

### 配置 (`transform.yaml`)

```yaml
type: transform
name: transform-agent
description: |
  一个使用 JSONata 表达式处理输入数据的 Transform Agent。
input_schema:
  type: object
  properties:
    user_id:
      type: string
      description: 用户的 ID。
    user_name:
      type: string
      description: 用户的姓名。
    created_at:
      type: string
      description: 用户的创建日期。
  required:
    - user_id
    - user_name
    - created_at
output_schema:
  type: object
  properties:
    userId:
      type: string
      description: 用户的 ID。
    userName:
      type: string
      description: 用户的姓名。
    createdAt:
      type: string
      description: 用户的创建日期。
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

### 用法

当 Agent 收到与 `input_schema` 匹配的输入消息时，它会应用 `jsonata` 表达式来转换数据。

**输入数据：**

```json
{
  "user_id": "usr_12345",
  "user_name": "John Doe",
  "created_at": "2023-10-27T10:00:00Z"
}
```

**输出数据：**

处理后，该 Agent 将生成以下符合 `output_schema` 的输出：

```json
{
  "userId": "usr_12345",
  "userName": "John Doe",
  "createdAt": "2023-10-27T10:00:00Z"
}
```