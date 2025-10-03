# Models

In the AIGNE framework, `Model` classes are specialized agents that serve as standardized interfaces for interacting with various underlying AI models, such as those from OpenAI, Anthropic, or Google. They abstract away the provider-specific complexities, allowing you to interact with different AI capabilities through a consistent API.

This design decouples your agent's logic from the specific AI model implementation. You can swap out a `gpt-4` model for a `claude-3` model with minimal changes to your agent's code, simply by changing the model agent instance.

The two primary base classes for models are:

*   **`ChatModel`**: For text-based, conversational AI (Large Language Models or LLMs).
*   **`ImageModel`**: For text-to-image generation models.

## ChatModel

The `ChatModel` is an abstract base class designed for interactions with LLMs. It standardizes the process of sending messages, defining tools, and handling responses, including text, JSON, and tool calls. Any specific model integration, like one for OpenAI's GPT series, will extend this class.

### ChatModel Input

The `ChatModelInput` interface defines the structure for providing information to the model.

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true">
    <x-field-desc markdown>An array of message objects that form the conversation history and the current prompt. Each message has a `role` (`system`, `user`, `agent`, or `tool`) and `content`.</x-field-desc>
  </x-field>
  <x-field data-name="responseFormat" data-type="object" data-required="false">
    <x-field-desc markdown>Specifies the desired output format. Can be `{ type: 'text' }` for plain text or `{ type: 'json_schema', jsonSchema: { ... } }` to enforce a specific JSON structure in the response.</x-field-desc>
  </x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false">
    <x-field-desc markdown>A list of function tools the model can choose to call. Each tool definition includes its `name`, `description`, and `parameters` defined as a JSON schema.</x-field-desc>
  </x-field>
  <x-field data-name="toolChoice" data-type="string | object" data-required="false">
    <x-field-desc markdown>Controls how the model uses tools. Can be `'auto'` (default), `'none'`, `'required'`, or an object specifying a particular function to call.</x-field-desc>
  </x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Provider-specific options to control model behavior.">
    <x-field data-name="model" data-type="string" data-required="false" data-desc="The specific model name or version (e.g., 'gpt-4o')."></x-field>
    <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness. A value closer to 0 makes the output more deterministic."></x-field>
    <x-field data-name="topP" data-type="number" data-required="false" data-desc="Controls nucleus sampling."></x-field>
    <x-field data-name="parallelToolCalls" data-type="boolean" data-default="true" data-required="false" data-desc="Whether to allow the model to call multiple tools in parallel."></x-field>
  </x-field>
</x-field-group>

### ChatModel Output

The `ChatModelOutput` interface represents the structured response from the model.

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false" data-desc="The text content of the model's response."></x-field>
  <x-field data-name="json" data-type="object" data-required="false" data-desc="The JSON object returned by the model when `responseFormat` is set to 'json_schema'."></x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false">
    <x-field-desc markdown>An array of tool calls requested by the model. Each object includes a unique `id`, the `function.name` to be called, and the `function.arguments` object.</x-field-desc>
  </x-field>
  <x-field data-name="usage" data-type="object" data-required="false" data-desc="Token usage statistics for the interaction.">
    <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="The number of tokens in the input prompt."></x-field>
    <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="The number of tokens in the generated response."></x-field>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The name of the model that processed the request."></x-field>
</x-field-group>

## ImageModel

The `ImageModel` is an abstract base class for text-to-image generation models. It provides a simple and consistent interface for creating images from text prompts.

### ImageModel Input

The `ImageModelInput` interface defines the data required to generate an image.

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="A detailed text description of the image to be generated."></x-field>
  <x-field data-name="image" data-type="FileUnionContent[]" data-required="false" data-desc="An optional array of images to be used for editing or as a base."></x-field>
  <x-field data-name="n" data-type="number" data-required="false" data-desc="The number of images to generate. Defaults to 1."></x-field>
  <x-field data-name="outputFileType" data-type="string" data-required="false" data-desc="Specifies the desired output format for the image file, such as 'local' (saved to a temporary file) or 'file' (base64 encoded string)."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Provider-specific options, such as `model` name, image dimensions, or quality settings."></x-field>
</x-field-group>

### ImageModel Output

The `ImageModelOutput` contains the generated images and usage data.

<x-field-group>
  <x-field data-name="images" data-type="FileUnionContent[]" data-required="true" data-desc="An array of the generated images, with each item's format determined by the `outputFileType` input parameter."></x-field>
  <x-field data-name="usage" data-type="object" data-required="false" data-desc="Token usage statistics for the generation task.">
      <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="The number of tokens in the input prompt."></x-field>
      <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="An estimation of tokens used for the output generation."></x-field>
  </x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The name of the image model that processed the request."></x-field>
</x-field-group>

## Summary

Models are the bridge between your AIGNE agents and the powerful AI capabilities offered by various providers. By using the `ChatModel` and `ImageModel` abstractions, you can build robust and flexible AI applications that are not tied to a single technology stack.

To learn how to construct the inputs for these models dynamically, proceed to the [Prompts](./developer-guide-core-concepts-prompts.md) section.