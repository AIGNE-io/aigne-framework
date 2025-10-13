This document provides a detailed overview of the `ChatModel` class, a fundamental component for interacting with Large Language Models (LLMs). It covers the class architecture, its input and output formats, and related data structures that enable powerful features like tool calls and structured data handling.

```d2
direction: down

User-Application: {
  label: "User / Application"
  shape: c4-person
}

ChatModel-System: {
  label: "ChatModel System"
  shape: rectangle

  ChatModel: {
    label: "ChatModel Instance"
  }

  LLM: {
    label: "Large Language Model"
    shape: cylinder
  }

  Tools: {
    label: "Tools / Functions"
  }
}

User-Application -> ChatModel-System.ChatModel: "1. invoke(Input)"
ChatModel-System.ChatModel -> ChatModel-System.LLM: "2. Send Formatted Request"
ChatModel-System.LLM -> ChatModel-System.ChatModel: "3. Receive LLM Response"

# Path A: Simple Text Response
ChatModel-System.ChatModel -> User-Application: "4a. Return Output with Text"

# Path B: Tool Call Response
ChatModel-System.ChatModel -> ChatModel-System.Tools: "4b. Execute Tool Call"
ChatModel-System.Tools -> ChatModel-System.ChatModel: "5b. Return Tool Result"
ChatModel-System.ChatModel -> ChatModel-System.LLM: "6b. Send Result for Final Answer"
ChatModel-System.LLM -> ChatModel-System.ChatModel: "7b. Receive Final Response"
ChatModel-System.ChatModel -> User-Application: "8b. Return Final Output"
```

## ChatModel

The `ChatModel` class is an abstract base class designed for interacting with Large Language Models (LLMs). It extends the `Agent` class and provides a standardized interface for managing model inputs, outputs, and capabilities. Concrete implementations for specific models (e.g., OpenAI, Anthropic) should inherit from this class.

### Core Concepts

- **Extensibility**: `ChatModel` is designed to be extended, allowing developers to create custom connectors for various LLMs by implementing the abstract `process` method.
- **Unified Interface**: It offers a consistent API for both streaming and non-streaming responses, simplifying interactions with different models.
- **Tool Integration**: The class provides built-in support for tool calls, enabling models to interact with external functions and data sources.
- **Structured Output**: `ChatModel` can enforce JSON schema compliance on model outputs, ensuring reliable, structured data.
- **Automatic Retries**: It includes a default retry mechanism for handling network errors and issues with structured output generation.

### Key Methods

#### `constructor(options?: ChatModelOptions)`

Creates a new instance of `ChatModel`.

<x-field-group>
  <x-field data-name="options" data-type="ChatModelOptions" data-required="false" data-desc="Configuration options for the agent.">
    <x-field data-name="model" data-type="string" data-required="false" data-desc="The name or identifier of the model to use."></x-field>
    <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="Default options to pass to the model on each invocation."></x-field>
    <x-field data-name="retryOnError" data-type="boolean | object" data-required="false" data-desc="Configuration for retrying on errors. Defaults to 3 retries for network and structured output errors."></x-field>
  </x-field>
</x-field-group>

#### `process(input: ChatModelInput, options: AgentInvokeOptions)`

The core abstract method that must be implemented by all subclasses. It handles the direct communication with the underlying LLM, including sending requests and processing responses.

<x-field-group>
  <x-field data-name="input" data-type="ChatModelInput" data-required="true" data-desc="The standardized input containing messages, tools, and model options."></x-field>
  <x-field data-name="options" data-type="AgentInvokeOptions" data-required="true" data-desc="Options for the agent invocation, including context and limits."></x-field>
</x-field-group>

#### `preprocess(input: ChatModelInput, options: AgentInvokeOptions)`

Performs operations before the main `process` method is called. This includes validating token limits and normalizing tool names to be compatible with the LLM.

#### `postprocess(input: ChatModelInput, output: ChatModelOutput, options: AgentInvokeOptions)`

Performs operations after the `process` method completes. Its primary role is to update token usage statistics in the invocation context.

### Input Data Structures

#### `ChatModelInput`

The main input interface for the `ChatModel`.

<x-field-group>
  <x-field data-name="messages" data-type="ChatModelInputMessage[]" data-required="true" data-desc="An array of messages to be sent to the model."></x-field>
  <x-field data-name="responseFormat" data-type="ChatModelInputResponseFormat" data-required="false" data-desc="Specifies the desired output format (e.g., text or JSON)."></x-field>
  <x-field data-name="outputFileType" data-type="FileType" data-required="false" data-desc="The desired format for file outputs ('local' or 'file')."></x-field>
  <x-field data-name="tools" data-type="ChatModelInputTool[]" data-required="false" data-desc="A list of tools the model can use."></x-field>
  <x-field data-name="toolChoice" data-type="ChatModelInputToolChoice" data-required="false" data-desc="The strategy for tool selection (e.g., 'auto', 'required')."></x-field>
  <x-field data-name="modelOptions" data-type="ChatModelInputOptions" data-required="false" data-desc="Model-specific configuration options."></x-field>
</x-field-group>

#### `ChatModelInputMessage`

Represents a single message in the conversation history.

<x-field-group>
    <x-field data-name="role" data-type="Role" data-required="true" data-desc="The role of the message author ('system', 'user', 'agent', or 'tool')."></x-field>
    <x-field data-name="content" data-type="ChatModelInputMessageContent" data-required="false" data-desc="The content of the message, which can be a string or a rich content array."></x-field>
    <x-field data-name="toolCalls" data-type="object[]" data-required="false" data-desc="For 'agent' roles, a list of tool calls requested by the model."></x-field>
    <x-field data-name="toolCallId" data-type="string" data-required="false" data-desc="For 'tool' roles, the ID of the tool call this message is a response to."></x-field>
</x-field-group>

#### `ChatModelInputTool`

Defines a tool that the model can invoke.

<x-field-group>
    <x-field data-name="type" data-type="'function'" data-required="true" data-desc="The type of the tool. Currently, only 'function' is supported."></x-field>
    <x-field data-name="function" data-type="object" data-required="true" data-desc="The function definition.">
        <x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the function."></x-field>
        <x-field data-name="description" data-type="string" data-required="false" data-desc="A description of what the function does."></x-field>
        <x-field data-name="parameters" data-type="object" data-required="true" data-desc="A JSON schema object defining the function's parameters."></x-field>
    </x-field>
</x-field-group>

### Output Data Structures

#### `ChatModelOutput`

The main output interface for the `ChatModel`.

<x-field-group>
  <x-field data-name="text" data-type="string" data-required="false" data-desc="The text response from the model."></x-field>
  <x-field data-name="json" data-type="object" data-required="false" data-desc="The JSON response from the model, if a JSON schema was requested."></x-field>
  <x-field data-name="toolCalls" data-type="ChatModelOutputToolCall[]" data-required="false" data-desc="A list of tool calls the model wants to execute."></x-field>
  <x-field data-name="usage" data-type="ChatModelOutputUsage" data-required="false" data-desc="Token usage statistics for the invocation."></x-field>
  <x-field data-name="model" data-type="string" data-required="false" data-desc="The name of the model that generated the response."></x-field>
  <x-field data-name="files" data-type="FileUnionContent[]" data-required="false" data-desc="A list of files generated by the model."></x-field>
</x-field-group>

#### `ChatModelOutputToolCall`

Represents a single tool call requested by the model.

<x-field-group>
    <x-field data-name="id" data-type="string" data-required="true" data-desc="A unique identifier for this tool call."></x-field>
    <x-field data-name="type" data-type="'function'" data-required="true" data-desc="The type of the tool."></x-field>
    <x-field data-name="function" data-type="object" data-required="true" data-desc="The function call details.">
        <x-field data-name="name" data-type="string" data-required="true" data-desc="The name of the function to call."></x-field>
        <x-field data-name="arguments" data-type="Message" data-required="true" data-desc="The arguments to pass to the function, parsed as a JSON object."></x-field>
    </x-field>
</x-field-group>

#### `ChatModelOutputUsage`

Provides information about token consumption.

<x-field-group>
    <x-field data-name="inputTokens" data-type="number" data-required="true" data-desc="The number of tokens used in the input prompt."></x-field>
    <x-field data-name="outputTokens" data-type="number" data-required="true" data-desc="The number of tokens generated in the output."></x-field>
    <x-field data-name="aigneHubCredits" data-type="number" data-required="false" data-desc="Credits consumed if using AIGNE Hub services."></x-field>
</x-field-group>