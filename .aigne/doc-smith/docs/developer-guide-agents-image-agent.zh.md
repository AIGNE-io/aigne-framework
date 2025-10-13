# ImageAgent

`ImageAgent` 是一个专门的 Agent，它扩展了基础 `Agent` 类，以便于根据文本指令生成图像。它与底层的 `ImageModel` 集成，以根据动态输入创建视觉内容。

该 Agent 非常适合需要自动创建图像的任务，例如生成头像、艺术插图或基于数据的可视化内容。

## 工作原理

`ImageAgent` 通过以下关键组件来协调图像生成过程：

1.  **PromptBuilder**：它使用 `PromptBuilder` 为图像模型构建详细的提示。初始化时提供的 `instructions` 作为模板，可以使用输入的动态数据进行填充。
2.  **ImageModel**：它要求在执行上下文中有一个可用的 `ImageModel`。该模型负责根据从 `PromptBuilder` 接收到的提示进行实际的图像渲染。
3.  **处理**：当调用 Agent 时，其 `process` 方法会构建最终的提示，使用该提示和任何指定的模型选项调用 `ImageModel`，并返回生成的图像输出。

下图说明了 `ImageAgent` 与其核心依赖项之间的关系：

```d2
direction: down

ImageAgent: {
  label: "ImageAgent"
  shape: rectangle
}

PromptBuilder: {
  label: "PromptBuilder"
  shape: rectangle
}

ImageModel: {
  label: "ImageModel\n（来自执行上下文）"
  shape: rectangle
}

ImageAgent -> PromptBuilder: "1. 使用指令构建提示"
ImageAgent -> ImageModel: "2. 使用提示和选项调用"
ImageModel -> ImageAgent: "3. 返回生成的图像"
```

## 类定义

`ImageAgent` 类为创建和配置图像生成 Agent 提供了主要接口。

### `ImageAgent.from(options)`

一个用于创建 `ImageAgent` 新实例的静态方法。

**参数**

<x-field-group>
  <x-field data-name="options" data-type="ImageAgentOptions" data-required="true" data-desc="该 Agent 的配置选项。"></x-field>
</x-field-group>

**返回**

<x-field data-name="" data-type="ImageAgent" data-desc="一个新的 ImageAgent 实例。"></x-field>

### `new ImageAgent(options)`

`ImageAgent` 类的构造函数。

**参数**

<x-field-group>
  <x-field data-name="options" data-type="ImageAgentOptions" data-required="true" data-desc="该 Agent 的配置选项。"></x-field>
</x-field-group>

## `ImageAgentOptions`

用于配置 `ImageAgent` 的选项对象。它扩展了基础的 `AgentOptions`。

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true" data-desc="一个字符串模板或 `PromptBuilder` 实例，用于定义生成图像的指令。可以使用占位符插入输入数据（例如 `{{object}}`）。"></x-field>
  <x-field data-name="modelOptions" data-type="Record<string, any>" data-required="false" data-desc="一个直接传递给底层图像模型的选项字典，允许对生成过程进行精细控制（例如，分辨率、质量）。"></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="指定输出图像所需的文件格式（例如 'png'、'jpeg'）。"></x-field>
</x-field-group>

## 使用示例

您可以通过编程方式在 TypeScript 中定义和使用 `ImageAgent`，也可以使用 YAML 进行声明式定义。

### 编程方式使用 (TypeScript)

以下是在代码中创建和调用 `ImageAgent` 的方法。

```typescript
import { ImageAgent } from "@AIGNE/core"; // 假设 AIGNE 是包名

// 1. 创建 ImageAgent 的实例
const drawingAgent = new ImageAgent({
  name: "drawing-agent",
  description: "An agent that draws an image based on a description and style.",
  instructions: "Draw an image of a {{object}} in the {{style}} style.",
});

// 2. 为 Agent 定义输入
const input = {
  object: "a serene lake at sunrise",
  style: "impressionistic",
};

// 3. 调用 Agent 生成图像
// 在调用 invoke 的上下文中必须有可用的 imageModel。
async function generateImage() {
  try {
    const result = await context.invoke(drawingAgent, input);
    // result.output 将包含生成的图像数据
    console.log("Image generated:", result.output);
    return result.output;
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();
```

### 声明式使用 (YAML)

Agent 也可以在 YAML 配置文件中定义，这对于在不同环境中加载它们非常有用。

以下示例定义了一个 `ImageAgent`，它可以根据指定的风格绘制一个对象。

```yaml
# packages/core/test-agents/image.yaml
type: image
name: test-image-agent
instructions: |
  绘制一张 {{style}} 风格的 {{object}} 图像。
input_schema:
  type: object
  properties:
    object:
      type: string
      description: 要绘制的对象。
    style:
      type: string
      description: 图像的风格。
  required:
    - object
    - style
```

这种声明式方法将 Agent 的定义与应用程序逻辑分开，使其易于管理和更新。