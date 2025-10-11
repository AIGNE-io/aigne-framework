# Model Classes

Model classes are abstract base classes designed to provide a standardized interface for interacting with various AI models, such as Large Language Models (LLMs) and image generation models. By extending these classes, you can create custom integrations for different AI service providers while maintaining a consistent API within the AIGNE framework.

This section documents the two primary model base classes: `ChatModel` for text-based interactions and `ImageModel` for image generation tasks.

## ChatModel

The `ChatModel` is an abstract base class for interacting with Large Language Models (LLMs). It extends the `Agent` class and provides a common interface for handling text-based inputs, outputs, tool calls, and other model capabilities. Specific model implementations (like OpenAI, Anthropic, etc.) should inherit from this class.

### ChatModelOptions

These options are used to configure a `ChatModel` instance.

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The specific model identifier (e.g., 'gpt-4-turbo')."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Model-specific configuration options to be passed with each request.">
    <x-field-desc markdown>See `ChatModelInputOptions` for details.</x-field-desc>
  </x-field>
  <x-field data-name="retryOnError" data-type="boolean | object" data-required="false" data-default="{ retries: 3, ... }">
    <x-field-desc markdown>Configuration for retrying on network errors or `StructuredOutputError`. Defaults to 3 retries.</x-field-desc>
  </x-field>
</x-field-group>

### ChatModelInput

This interface defines the structure of the input sent to a `ChatModel`'s `process` method.

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true" data-desc="An array of messages that form the conversation history."></x-field>
  <x-field data-name="responseFormat" data-type="object" data-required="false" data-desc="Specifies the desired format for the model's response.">
    <x-field data-name="type" data-type="'text' | 'json_schema'" data-required="true" data-desc="The type of response format."></x-field>
    <x-field data-name="jsonSchema" data-type="object" data-required="false" data-desc="Required if type is 'json_schema'. Defines the schema for the JSON output.">
      <x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the schema."></x-field>
      <x-field data-name="description" data-type="string" data-required="false" data-desc="A description of the schema."></x-field>
      <x-field data-name="schema" data-type="object" data-required="true" data-desc="The JSON schema definition."></x-field>
      <x-field data-name="strict" data-type="boolean" data-required="false" data-desc="Whether to enforce strict schema validation."></x-field>
    </x-field>
  </x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="Specifies the desired file format for any output files (e.g., 'local', 'file')."></x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false" data-desc="A list of tools the model can choose to call."></x-field>
  <x-field data-name="toolChoice" data-type="string | object" data-required="false" data-desc="Controls how the model uses tools. Can be 'auto', 'none', 'required', or an object specifying a function."></x-field>
  <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="Model-specific configuration options for this request."></x-field>
</x-field-group>

#### ChatModelInputMessage

<x-field-group>
  <x-field data-name="role" data-type="'system' | 'user' | 'agent' | 'tool'" data-required="true" data-desc="The role of the message author."></x-field>
  <x-field data-name="content" data-type="string | UnionContent[]" data-required="false" data-desc="The message content, which can be a simple string or an array for multimodal content."></x-field>
  <x-field data-name="toolCalls" data-type="object[]" data-required="false" data-desc="For 'agent' roles, a list of tool calls requested by the model.">
      <x-field data-name="id" data-type="string" data-required="true" data-desc="A unique identifier for the tool call."></x-field>
      <x-field data-name="type" data-type="'function'" data-required="true" data-desc="The type of the tool, currently only 'function'."></x-field>
      <x-field data-name="function" data-type="object" data-required="true" data-desc="Details of the function to be called.">
          <x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the function."></x-field>
          <x-field data-name="arguments" data-type="Message" data-required="true" data-desc="The arguments to pass to the function."></x-field>
      </x-field>
  </x-field>
  <x-field data-name="toolCallId" data-type="string" data-required="false" data-desc="For 'tool' roles, the ID of the tool call this message is a response to."></x-field>
  <x-field data-name="name" data-type="string" data-required="false" data-desc="The name of the message sender, useful in multi-agent scenarios."></x-field>
</x-field-group>

#### ChatModelInputOptions

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="Model name or version for this specific request."></x-field>
  <x-field data-name="temperature" data-type="number" data-required="false" data-desc="Controls randomness (0-1). Higher values mean more random outputs."></x-field>
  <x-field data-name="topP" data-type="number" data-required="false" data-desc="Controls diversity via nucleus sampling."></x-field>
  <x-field data-name="frequencyPenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on their existing frequency in the text so far."></x-field>
  <x-field data-name="presencePenalty" data-type="number" data-required="false" data-desc="Penalizes new tokens based on whether they appear in the text so far."></x-field>
  <x-field data-name="parallelToolCalls" data-type="boolean" data-required="false" data-desc="Whether to allow the model to make parallel tool calls."></x-field>
  <x-field data-name="modalities" data-type="('text' | 'image' | 'audio')[]" data-required="false" data-desc="Specifies the modalities the model should handle."></x-field>
  <x-field data-name="preferInputFileType" data-type="'file' | 'url'" data-required="false" data-desc="Preferred format for handling file inputs."></x-field>
</x-field-group>

### ChatModelOutput

This interface defines the structure of the output returned by a `ChatModel`.

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false" data-desc="The text content of the model's response."></x-field>
  <x-field data-name="json" data-type="object" data-required="false" data-desc="The JSON object returned by the model if `responseFormat` was set to `json_schema`."></x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false" data-desc="A list of tool calls the model requests to be executed."></x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false" data-desc="Token usage statistics for the request."></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The identifier of the model that generated the response."></x-field>
  <x-field data-name="files" data-type="FileUnionContent[]" data-required="false" data-desc="An array of files generated by the model."></x-field>
</x-field-group>

#### ChatModelOutputToolCall

<x-field-group>
  <x-field data-name="id" data-type="string" data-required="true" data-desc="A unique identifier for the tool call."></x-field>
  <x-field data-name="type" data-type="'function'" data-required="true" data-desc="The type of tool, currently only 'function'."></x-field>
  <x-field data-name="function" data-type="object" data-required="true" data-desc="Details of the function to be called.">
    <x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the function to call."></x-field>
    <x-field data-name="arguments" data-type="Message" data-required="true" data-desc="The arguments to pass to the function, typically as a JSON object."></x-field>
  </x-field>
</x-field-group>

#### ChatModelOutputUsage

<x-field-group>
  <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="The number of tokens in the input prompt."></x-field>
  <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="The number of tokens in the generated response."></x-field>
  <x-field data-name="aigneHubCredits" data-type="number" data-required="false" data-desc="Credit usage if the request was processed via AIGNE Hub."></x-field>
</x-field-group>

## ImageModel

The `ImageModel` is an abstract base class for interacting with image generation and editing models. It provides a standardized interface for sending prompts and receiving image data.

### ImageModelOptions

These options are used to configure an `ImageModel` instance.

<x-field-group>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The specific image model identifier (e.g., 'dall-e-3')."></x-field>
  <x-field data-name="modelOptions" data-type="object" data-required="false" data-desc="Model-specific configuration options to be passed with each request.">
    <x-field-desc markdown>See `ImageModelInputOptions` for details.</x-field-desc>
  </x-field>
</x-field-group>

### ImageModelInput

This interface defines the structure of the input sent to an `ImageModel`.

<x-field-group>
  <x-field data-name="prompt" data-type="string" data-required="true" data-desc="The text prompt describing the desired image."></x-field>
  <x-field data-name="image" data-type="FileUnionContent[]" data-required="false" data-desc="An array of source images used for editing or inspiration."></x-field>
  <x-field data-name="n" data-type="number" data-required="false" data-desc="The number of images to generate."></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="Specifies the desired file format for the output images (e.g., 'local', 'file')."></x-field>
  <x-field data-name="modelOptions" data-type="ImageModelInputOptions" data-required="false" data-desc="Model-specific configuration options for this request."></x-field>
</x-field-group>

#### ImageModelInputOptions

<x-field-group>
    <x-field data-name="model" data-type="string" data-required="false" data-desc="Model name or version for this specific request."></x-field>
    <x-field data-name="preferInputFileType" data-type="'file' | 'url'" data-required="false" data-desc="Preferred format for handling input images."></x-field>
</x-field-group>

### ImageModelOutput

This interface defines the structure of the output returned by an `ImageModel`.

<x-field-group>
  <x-field data-name="images" data-type="FileUnionContent[]" data-required="true" data-desc="An array of the generated images."></x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false" data-desc="Token and resource usage statistics for the request."></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The identifier of the model that generated the images."></x-field>
</x-field-group>

## File Content Types

Both `ChatModel` and `ImageModel` use a common set of types to represent file-based content. This allows for flexible handling of local files, remote URLs, and base64-encoded data.

### UrlContent

Represents a file located at a remote URL.

<x-field-group>
  <x-field data-name="type" data-type="'url'" data-required="true" data-desc="The literal type identifier."></x-field>
  <x-field data-name="url" data-type="string" data-required="true" data-desc="The URL of the file."></x-field>
  <x-field data-name="filename" data-type="string" data-required="false" data-desc="An optional filename for the content."></x-field>
  <x-field data-name="mimeType" data-type="string" data-required="false" data-desc="The MIME type of the file."></x-field>
</x-field-group>

### FileContent

Represents a file as a base64-encoded string.

<x-field-group>
  <x-field data-name="type" data-type="'file'" data-required="true" data-desc="The literal type identifier."></x-field>
  <x-field data-name="data" data-type="string" data-required="true" data-desc="The base64-encoded file data."></x-field>
  <x-field data-name="filename" data-type="string" data-required="false" data-desc="An optional filename for the content."></x-field>
  <x-field data-name="mimeType" data-type="string" data-required="false" data-desc="The MIME type of the file."></x-field>
</x-field-group>

### LocalContent

Represents a file stored on the local filesystem.

<x-field-group>
  <x-field data-name="type" data-type="'local'" data-required="true" data-desc="The literal type identifier."></x-field>
  <x-field data-name="path" data-type="string" data-required="true" data-desc="The local filesystem path to the file."></x-field>
  <x-field data-name="filename" data-type="string" data-required="false" data-desc="An optional filename for the content."></x-field>
  <x-field data-name="mimeType" data-type="string" data-required="false" data-desc="The MIME type of the file."></x-field>
</x-field-group>