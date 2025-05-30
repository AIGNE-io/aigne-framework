# ⚡ 通过 JS Function 创建 Agent - 程序员的最爱

[English](function.md) | **中文**

💻 代码就是力量！对于程序员来说，没有什么比用熟悉的 JavaScript 来创建 AI Agent 更令人兴奋的了。这种方式让您拥有完全的控制权，可以实现任何您能想象的功能。

## 💡 基本结构 - 简洁而强大的代码模式

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

## 🔧 结构详解 - 每一行代码都有深意

* `export default async function xxx()`: 🎯 导出工具的主函数，这就是您的 AI Agent 的大脑！接收输入参数并返回结果
* `xxx.description`: 📝 函数描述，给您的 Agent 一个清晰的身份介绍
* `xxx.input_schema`: 📥 输入参数的 JSON Schema 定义，告诉 AI 期望接收什么样的数据
* `xxx.output_schema`: 📤 输出结果的 JSON Schema 定义，确保返回的数据格式规范统一

## 🧪 代理测试文件 - 品质保证的守护神

质量是程序员的生命！AIGNE 完美支持 Node.js 内置测试框架，让您轻松为 Agent 编写测试。测试文件通常与代理实现文件位于同一目录，命名为 `xxx.test.js`。

### 🚀 基本测试示例 - 快速验证功能

```javascript
import assert from "node:assert";
import plus from "./plus.js";

assert.deepEqual(await plus({ a: 1, b: 2 }), { sum: 3 });
```

### 🏆 高级测试示例 - 全面覆盖各种场景

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

🎊 **完美！** 您已经解锁了 JavaScript Agent 的全部技能。现在您可以：

✅ 用熟悉的 JavaScript 语法创建智能 Agent
✅ 实现复杂的业务逻辑和算法
✅ 编写完整的测试用例保证质量
✅ 享受编程的乐趣与 AI 的智能完美结合

💪 **程序员的优势：** 完全控制、无限可能、代码即文档！

🚀 **开始编码吧！** 让您的创意通过代码变成智能的 AI Agent！
