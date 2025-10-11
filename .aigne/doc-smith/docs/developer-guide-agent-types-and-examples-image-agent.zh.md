# Image Agent

`ImageAgent` 是一个专门用于根据文本描述生成图像的 Agent。它充当您的输入数据和底层图像生成模型之间的桥梁，允许您根据提示动态创建图像。

此 Agent 特别适用于以下任务：
- 为内容生成插图。
- 根据描述创建产品模型。
- 可视化数据或概念。

## 工作原理

`ImageAgent` 接受一组 `instructions`（提示模板）和输入数据。它使用 `PromptBuilder` 将这些组合成最终的文本提示。然后，此提示被发送到配置的 `ImageModel`（例如 DALL-E 或 Stable Diffusion 的模型），该模型处理文本并返回生成的图像数据。该 Agent 需要在执行上下文中有一个可用的 `imageModel` 才能运行。

## 配置

您可以通过 YAML 定义或直接在代码中配置 `ImageAgent`。

### YAML 配置

以下是在 YAML 文件中定义 `ImageAgent` 的示例。这种方法对于动态加载 Agent 配置非常有用。

```yaml test-image-agent.yaml icon=mdi:file-yaml
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

- **type**：必须是 `image` 以指定为 `ImageAgent`。
- **name**：Agent 的唯一标识符。
- **instructions**：提示的模板。它使用 `{{variable}}` 语法从输入中插入数据。
- **input_schema**：定义预期输入对象的 JSON schema。

### TypeScript 配置

在代码中直接创建 `ImageAgent` 实例时，您需要使用 `ImageAgentOptions` 对象。

**参数**

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true">
    <x-field-desc markdown>用于生成图像的提示模板。您可以提供原始字符串或 `PromptBuilder` 实例以实现更复杂的逻辑。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="Record<string, any>" data-required="false">
    <x-field-desc markdown>一个键值对对象，包含直接传递给底层图像模型的选项，例如 `quality`、`size` 或 `n`（图像数量）。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false">
    <x-field-desc markdown>指定输出所需的文件类型，例如 `png` 或 `jpeg`。</x-field-desc>
  </x-field>
</x-field-group>

## 使用示例

以下示例演示了如何在 TypeScript 中创建和调用 `ImageAgent`。

```typescript ImageAgent Example icon=logos:typescript
import { AIGNE, ImageAgent, type ImageModelOutput } from "@aigne/core";
import { MockImageModel } from "@aigne/mock-models";

// 1. 定义 Image Agent
const imageAgent = new ImageAgent({
  name: "artist-agent",
  description: "一个根据描述绘制图像的 Agent。",
  instructions: "创建一张在 {{timeOfDay}} 的 {{subject}} 的生动图像。",
});

// 2. 实例化 AIGNE 引擎并注册一个模型
const mockImageModel = new MockImageModel();
const aigne = new AIGNE({
  imageModel: mockImageModel,
});

// 3. 定义输入数据
const input = {
  subject: "futuristic city skyline",
  timeOfDay: "sunset",
};

// 4. 调用 Agent
async function run() {
  const result: ImageModelOutput = await aigne.invoke(imageAgent, input);

  console.log("图片生成成功：");
  console.log(result.files);
}

run();

```

### 输入

`invoke` 方法接收一个与 `instructions` 提示中变量相匹配的输入对象。

```json Input icon=mdi:code-json
{
  "subject": "futuristic city skyline",
  "timeOfDay": "sunset"
}
```

### 输出

该 Agent 返回一个 `ImageModelOutput` 对象，其中包含一个文件数组。每个文件对象都包含其名称、内容类型以及图像数据本身（例如，作为 Buffer 或 base64 字符串）。

```json Example Response icon=mdi:code-json
{
  "files": [
    {
      "name": "image.png",
      "contentType": "image/png",
      "content": "<Buffer ...>"
    }
  ]
}
```