# 通过 JS Function 创建 Agent

[English](function.md) | **中文**

使用 JavaScript 函数创建 AI Agent 为开发者提供了灵活的编程方式。通过熟悉的 JavaScript 语法，您可以实现复杂的业务逻辑和自定义功能。

## 基本结构

```javascript
export default async function plus({ a, b }) {
  return { sum: a + b };
}

plus.description = "This agent adds two numbers together.";

plus.input_schema = {
  type: "object",
  properties: {
    a: { type: "number", description: "First number" },
    b: { type: "number", description: "Second number" },
  },
  required: ["a", "b"],
};

plus.output_schema = {
  type: "object",
  properties: {
    sum: { type: "number", description: "Sum of a and b" },
  },
  required: ["sum"],
};
```

## 结构说明

* `export default async function xxx()`: 导出的主函数，接收输入参数并返回结果
* `xxx.description`: 函数描述
* `xxx.input_schema`: 输入参数的 JSON Schema 定义
* `xxx.output_schema`: 输出结果的 JSON Schema 定义

## 测试文件

AIGNE 支持 Node.js 内置测试框架，您可以为 Agent 编写测试用例。测试文件通常与代理实现文件位于同一目录，命名为 `xxx.test.js`。

### 基本测试示例

```javascript
import assert from "node:assert";
import plus from "./plus.js";

assert.deepEqual(await plus({ a: 1, b: 2 }), { sum: 3 });
```

### 高级测试示例

```javascript
import assert from "node:assert";
import { describe, it } from "node:test";
import plus from "./plus.js";

describe("Plus Agent", () => {
  it("should add two positive numbers", async () => {
    const result = await plus({ a: 5, b: 3 });
    assert.deepEqual(result, { sum: 8 });
  });

  it("should add negative numbers", async () => {
    const result = await plus({ a: -2, b: -3 });
    assert.deepEqual(result, { sum: -5 });
  });

  it("should handle zero", async () => {
    const result = await plus({ a: 0, b: 5 });
    assert.deepEqual(result, { sum: 5 });
  });

  it("should handle decimal numbers", async () => {
    const result = await plus({ a: 1.5, b: 2.5 });
    assert.deepEqual(result, { sum: 4 });
  });
});
```

***

通过 JavaScript 函数创建 Agent 的主要优势：

* 使用熟悉的 JavaScript 语法
* 实现复杂的业务逻辑和算法
* 编写完整的测试用例保证质量
* 完全控制代码逻辑和执行流程

**开发建议：** 先实现基本功能，然后逐步添加错误处理和边界情况的测试。
