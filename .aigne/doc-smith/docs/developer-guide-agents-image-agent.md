# ImageAgent

The `ImageAgent` is a specialized agent that extends the base `Agent` class to facilitate the generation of images from textual instructions. It integrates with an underlying `ImageModel` to create visual content based on dynamic inputs.

This agent is ideal for tasks that require automated image creation, such as generating avatars, artistic illustrations, or visualizations based on data.

## How it Works

The `ImageAgent` orchestrates the image generation process through these key components:

1.  **PromptBuilder**: It uses a `PromptBuilder` to construct a detailed prompt for the image model. The `instructions` provided during initialization serve as a template, which can be populated with dynamic data from the input.
2.  **ImageModel**: It requires an `ImageModel` to be available in the execution context. This model is responsible for the actual image rendering based on the prompt received from the `PromptBuilder`.
3.  **Processing**: When the agent is invoked, its `process` method builds the final prompt, invokes the `ImageModel` with the prompt and any specified model options, and returns the generated image output.

This diagram illustrates the relationship between the `ImageAgent` and its core dependencies:

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
  label: "ImageModel\n(from execution context)"
  shape: rectangle
}

ImageAgent -> PromptBuilder: "1. Constructs prompt using instructions"
ImageAgent -> ImageModel: "2. Invokes with prompt and options"
ImageModel -> ImageAgent: "3. Returns generated image"
```

## Class Definition

The `ImageAgent` class provides the primary interface for creating and configuring image-generating agents.

### `ImageAgent.from(options)`

A static method to create a new instance of `ImageAgent`.

**Parameters**

<x-field-group>
  <x-field data-name="options" data-type="ImageAgentOptions" data-required="true" data-desc="The configuration options for the agent."></x-field>
</x-field-group>

**Returns**

<x-field data-name="" data-type="ImageAgent" data-desc="A new instance of ImageAgent."></x-field>

### `new ImageAgent(options)`

The constructor for the `ImageAgent` class.

**Parameters**

<x-field-group>
  <x-field data-name="options" data-type="ImageAgentOptions" data-required="true" data-desc="The configuration options for the agent."></x-field>
</x-field-group>

## `ImageAgentOptions`

The options object for configuring an `ImageAgent`. It extends the base `AgentOptions`.

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true" data-desc="A string template or a `PromptBuilder` instance that defines the instructions for generating the image. Placeholders can be used to insert input data (e.g., `{{object}}`)."></x-field>
  <x-field data-name="modelOptions" data-type="Record<string, any>" data-required="false" data-desc="A dictionary of options to pass directly to the underlying image model, allowing for fine-tuned control over the generation process (e.g., resolution, quality)."></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="Specifies the desired file format for the output image (e.g., 'png', 'jpeg')."></x-field>
</x-field-group>

## Usage Examples

You can define and use an `ImageAgent` both programmatically in TypeScript or declaratively using YAML.

### Programmatic Usage (TypeScript)

Here's how to create and invoke an `ImageAgent` in your code.

```typescript
import { ImageAgent } from "@AIGNE/core"; // Assuming AIGNE is the package name

// 1. Create an instance of the ImageAgent
const drawingAgent = new ImageAgent({
  name: "drawing-agent",
  description: "An agent that draws an image based on a description and style.",
  instructions: "Draw an image of a {{object}} in the {{style}} style.",
});

// 2. Define the input for the agent
const input = {
  object: "a serene lake at sunrise",
  style: "impressionistic",
};

// 3. Invoke the agent to generate the image
// An imageModel must be available in the context where invoke is called.
async function generateImage() {
  try {
    const result = await context.invoke(drawingAgent, input);
    // The result.output will contain the generated image data
    console.log("Image generated:", result.output);
    return result.output;
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generateImage();
```

### Declarative Usage (YAML)

Agents can also be defined in YAML configuration files, which is useful for loading them in different environments.

The following example defines an `ImageAgent` that draws an object in a specified style.

```yaml
# packages/core/test-agents/image.yaml
type: image
name: test-image-agent
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

This declarative approach separates the agent's definition from the application logic, making it easy to manage and update.