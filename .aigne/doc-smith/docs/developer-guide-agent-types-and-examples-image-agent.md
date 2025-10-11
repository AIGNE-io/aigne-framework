# Image Agent

The `ImageAgent` is a specialized agent designed to generate images from textual descriptions. It acts as a bridge between your input data and an underlying image generation model, allowing you to dynamically create images based on prompts.

This agent is particularly useful for tasks such as:
- Generating illustrations for content.
- Creating product mockups from descriptions.
- Visualizing data or concepts.

## How It Works

The `ImageAgent` takes a set of `instructions` (a prompt template) and input data. It uses a `PromptBuilder` to combine these into a final text prompt. This prompt is then sent to a configured `ImageModel` (like one for DALL-E or Stable Diffusion), which processes the text and returns the generated image data. The agent requires an `imageModel` to be available in the execution context to function.

## Configuration

You can configure an `ImageAgent` either through a YAML definition or directly in your code.

### YAML Configuration

Here is an example of defining an `ImageAgent` in a YAML file. This approach is useful for loading agent configurations dynamically.

```yaml test-image-agent.yaml icon=mdi:file-yaml
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

- **type**: Must be `image` to specify an `ImageAgent`.
- **name**: A unique identifier for the agent.
- **instructions**: A template for the prompt. It uses `{{variable}}` syntax to insert data from the input.
- **input\_schema**: A JSON schema defining the expected input object.

### TypeScript Configuration

When creating an `ImageAgent` instance directly in your code, you use the `ImageAgentOptions` object.

**Parameters**

<x-field-group>
  <x-field data-name="instructions" data-type="string | PromptBuilder" data-required="true">
    <x-field-desc markdown>The prompt template used to generate the image. You can provide a raw string or an instance of `PromptBuilder` for more complex logic.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="Record<string, any>" data-required="false">
    <x-field-desc markdown>A key-value object of options to pass directly to the underlying image model, such as `quality`, `size`, or `n` (number of images).</x-field-desc>
  </x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false">
    <x-field-desc markdown>Specifies the desired file type for the output, such as `png` or `jpeg`.</x-field-desc>
  </x-field>
</x-field-group>

## Usage Example

The following example demonstrates how to create and invoke an `ImageAgent` in TypeScript.

```typescript ImageAgent Example icon=logos:typescript
import { AIGNE, ImageAgent, type ImageModelOutput } from "@aigne/core";
import { MockImageModel } from "@aigne/mock-models";

// 1. Define the Image Agent
const imageAgent = new ImageAgent({
  name: "artist-agent",
  description: "An agent that draws images based on a description.",
  instructions: "Create a vivid image of a {{subject}} during {{timeOfDay}}.",
});

// 2. Instantiate the AIGNE engine and register a model
const mockImageModel = new MockImageModel();
const aigne = new AIGNE({
  imageModel: mockImageModel,
});

// 3. Define the input data
const input = {
  subject: "futuristic city skyline",
  timeOfDay: "sunset",
};

// 4. Invoke the agent
async function run() {
  const result: ImageModelOutput = await aigne.invoke(imageAgent, input);

  console.log("Image generation successful:");
  console.log(result.files);
}

run();

```

### Input

The `invoke` method receives an input object matching the variables in the `instructions` prompt.

```json Input icon=mdi:code-json
{
  "subject": "futuristic city skyline",
  "timeOfDay": "sunset"
}
```

### Output

The agent returns an `ImageModelOutput` object, which contains an array of files. Each file object includes its name, content type, and the image data itself (e.g., as a Buffer or base64 string).

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