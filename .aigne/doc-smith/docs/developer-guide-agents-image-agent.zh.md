# Image Agent

`ImageAgent` 是一个专门负责生成图像的 Agent。它充当 `ImageModel` 的接口，处理输入数据以构建提示，然后请求图像生成服务来创建图像。

对于任何需要基于文本描述动态创建视觉内容的工作流来说，此 Agent 都是必不可少的。它利用 `PromptBuilder` 来构建提示，从而能够使用模板根据可变输入生成图像。

```d2
direction: down

# External Actor
User: {
  label: "用户 / 应用程序"
  shape: c4-person
}

# Configuration Sources
Configuration: {
  label: "配置方法"
  shape: rectangle
  style.stroke-dash: 2

  TS-Config: {
    label: "TypeScript\n`ImageAgent.from()`"
  }

  YAML-Config: {
    label: "YAML\n`.yaml` 文件"
  }
}

# AIGNE Framework
AIGNE-Framework: {
  label: "AIGNE 框架"
  shape: rectangle

  AIGNE: {
    label: "AIGNE 实例"
  }

  Agent-Subsystem: {
    label: "Agent 子系统"
    shape: rectangle
    style.stroke-dash: 2

    ImageAgent: {
      label: "ImageAgent"
    }

    PromptBuilder: {
      label: "PromptBuilder"
    }
  }

  ImageModel: {
    label: "ImageModel\n（例如，dall-e-3）"
  }
}

# Configuration Flow (defines relationships)
Configuration.TS-Config -> AIGNE-Framework.Agent-Subsystem.ImageAgent: "定义"
Configuration.YAML-Config -> AIGNE-Framework.Agent-Subsystem.ImageAgent: "定义"
AIGNE-Framework.AIGNE -> AIGNE-Framework.ImageModel: {
  label: "配置有"
  style.stroke-dash: 2
}

# Invocation Flow (runtime)
User -> AIGNE-Framework.AIGNE: "1. aigne.invoke(agent, input)"
AIGNE-Framework.AIGNE -> AIGNE-Framework.Agent-Subsystem.ImageAgent: "2. 传递请求"
AIGNE-Framework.Agent-Subsystem.ImageAgent -> AIGNE-Framework.Agent-Subsystem.PromptBuilder: "3. 根据指令和输入\n构建提示"
AIGNE-Framework.Agent-Subsystem.PromptBuilder -> AIGNE-Framework.Agent-Subsystem.ImageAgent: "4. 返回最终提示"
AIGNE-Framework.Agent-Subsystem.ImageAgent -> AIGNE-Framework.ImageModel: "5. 使用提示和\nmodelOptions 调用模型"
AIGNE-Framework.ImageModel -> AIGNE-Framework.Agent-Subsystem.ImageAgent: "6. 返回 ImageModelOutput"
AIGNE-Framework.Agent-Subsystem.ImageAgent -> AIGNE-Framework.AIGNE: "7. 转发结果"
AIGNE-Framework.AIGNE -> User: "8. 返回最终输出\n（url/base64）"

```

## 配置

`ImageAgent` 可以通过 TypeScript 以编程方式配置，也可以通过 YAML 以声明方式配置。两种方法都需要定义图像生成的指令，并可选择性地指定模型特定参数。

### TypeScript 配置

要在 TypeScript 中创建 `ImageAgent`，请使用静态的 `ImageAgent.from()` 方法并为其提供 `ImageAgentOptions`。

```typescript "ImageAgent 配置" icon=logos:typescript
import { AIGNE, ImageAgent } from "@aigne/core";
import { OpenAI } from "@aigne/openai";

// 配置图像模型提供程序
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 创建 ImageAgent 实例
const architectAgent = ImageAgent.from({
  name: "architect",
  description: "An agent that draws architectural diagrams.",
  instructions: "Create an architectural diagram of a {{subject}}.",
  modelOptions: {
    quality: "hd",
    style: "vivid",
  },
});

// AIGNE 实例必须配置一个 imageModel
const aigne = new AIGNE({
  imageModel: openai.image("dall-e-3"),
});

async function run() {
  const result = await aigne.invoke(architectAgent, {
    input: {
      subject: "microservices application",
    },
  });

  console.log(result);
}

run();
```

上述代码定义了一个名为 "architect" 的 `ImageAgent`。它使用一个带模板的 `instructions` 字符串来生成提示。`modelOptions` 对象将特定参数传递给底层的 DALL-E 3 模型，以请求生成高清、生动的图像。

### YAML 配置

或者，您也可以在 `.yaml` 文件中定义 `ImageAgent`。这种方法有助于将 Agent 定义与应用程序逻辑分离。

```yaml "image-agent.yaml" icon=logos:yaml
type: image
name: style-artist
description: Draws an image of an object in a specific style.
instructions: |
  Draw an image of a {{object}} in the {{style}} style.
input_schema:
  type: object
  properties:
    object:
      type: string
      description: The object to draw.
    style:
      type: string
      description: The style of the image.
  required:
    - object
    - style
```

在这个声明式示例中，`type: image` 指定了这是一个 `ImageAgent`。`instructions` 字段包含一个带有占位符（`{{object}}`、`{{style}}`）的多行字符串，这些占位符将在调用期间从输入中填充。`input_schema` 正式定义了预期的输入结构。

## 参数

`ImageAgent` 的行为由其构建期间提供的选项控制。

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true">
    <x-field-desc markdown>用于图像生成的提示模板。可以是一个简单的字符串，也可以是一个用于更复杂逻辑的 `PromptBuilder` 实例。格式为 `{{key}}` 的占位符将被输入对象中的值替换。</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="Record<string, any>" data-required="false">
    <x-field-desc markdown>一个包含要传递给底层 `ImageModel` 的特定于提供程序的参数的对象。这允许对生成过程进行微调控制，例如指定图像质量、尺寸或风格。有关可用选项，请参考特定模型提供程序的文档。</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="'url' | 'base64'" data-required="false">
    <x-field-desc markdown>指定输出图像的所需格式。默认行为由 `ImageModel` 决定，但您可以明确请求公共 URL (`url`) 或 Base64 编码的字符串 (`base64`)。</x-field-desc>
  </x-field>
</x-field-group>

## 调用与输出

当调用 `ImageAgent` 时，它会将输入传递给其 `PromptBuilder` 以生成最终的提示。然后，它会使用此提示和任何指定的 `modelOptions` 调用已配置的 `ImageModel`。

Agent 的输出是一个符合 `ImageModelOutput` 模式的对象，其中包含所请求格式的生成图像。

**调用示例**

```typescript "调用 Agent" icon=logos:typescript
const result = await aigne.invoke(styleArtistAgent, { // 假设 styleArtistAgent 是从 YAML 加载的
  input: {
    object: "futuristic city",
    style: "cyberpunk",
  },
});
```

**响应示例**

```json "ImageAgent 输出" icon=mdi:code-json
{
  "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/...",
  "base64": null
}
```

响应包含一个指向生成图像的 `url`。如果 `outputFileType` 设置为 `'base64'`，则会填充 `base64` 字段。

## 总结

`ImageAgent` 提供了一种结构化且可重用的方式，可将图像生成功能集成到您的 AI 工作流中。通过将提示逻辑与模型交互分离，它有助于实现清晰且可维护的 Agent 设计。

有关其他 Agent 类型的更多信息，请参阅以下文档：
- [AI Agent](./developer-guide-agents-ai-agent.md)：用于与语言模型交互。
- [Team Agent](./developer-guide-agents-team-agent.md)：用于编排多个 Agent。
- [Function Agent](./developer-guide-agents-function-agent.md)：用于将自定义代码包装为 Agent。