# run

The `aigne run` command is your primary tool for interacting with and testing an AI agent. It allows you to start an interactive chat session in your terminal or send a single prompt to an agent to see how it responds.

## Usage

Here are the common ways to use the `run` command:

```bash Basic Usage
# Run the default agent in the current directory
aigne run

# Run a specific agent by name
aigne run <agent-name>

# Run an agent located in a different directory
aigne run --path /path/to/your/project

# Run an agent directly from a remote URL
aigne run --url https://example.com/aigne-project.zip
```

## Arguments

<x-field-group>
  <x-field data-name="path" data-type="string" data-required="false" data-desc="The local directory path or remote URL of the AIGNE project. If not provided, it defaults to the current directory (".")."></x-field>
  <x-field data-name="entry-agent" data-type="string" data-required="false" data-desc="The name of the specific agent you want to run. If omitted, AIGNE will run the default agent defined in the project."></x-field>
</x-field-group>

## Options

These options allow you to customize the agent's execution environment, model parameters, and input/output handling.

### General Options

<x-field-group>
  <x-field data-name="--chat" data-type="boolean" data-default="false" data-required="false" data-desc="Starts an interactive chat loop in the terminal, allowing for a continuous conversation with the agent."></x-field>
  <x-field data-name="--entry-agent <name>" data-type="string" data-required="false" data-desc="Specifies the agent to run by its name. This is an alternative to the positional entry-agent argument."></x-field>
  <x-field data-name="--cache-dir <dir>" data-type="string" data-required="false" data-desc="Specifies a custom directory to download and cache remote agent packages when using the --url option."></x-field>
  <x-field data-name="--log-level <level>" data-type="string" data-default="silent" data-required="false">
    <x-field-desc markdown>Sets the verbosity of logs. Available levels are `silent`, `error`, `warn`, `info`, `debug`, `trace`.</x-field-desc>
  </x-field>
  <x-field data-name="--verbose" data-type="boolean" data-required="false" data-desc="A shorthand for enabling verbose logging. Equivalent to `--log-level debug`."></x-field>
</x-field-group>

### Model Options

<x-field-group>
  <x-field data-name="--model <provider[:model]>" data-type="string" data-required="false" data-desc="Specifies the AI model to use, e.g., 'openai' or 'openai:gpt-4o-mini'. This overrides the model defined in the agent's configuration."></x-field>
  <x-field data-name="--temperature <value>" data-type="number" data-required="false" data-desc="Controls randomness. Higher values (e.g., 0.8) make the output more random, while lower values (e.g., 0.2) make it more deterministic. Range: 0.0 to 2.0."></x-field>
  <x-field data-name="--top-p <value>" data-type="number" data-required="false" data-desc="Controls diversity via nucleus sampling. A lower value (e.g., 0.1) means only the most probable tokens are considered. Range: 0.0 to 1.0."></x-field>
  <x-field data-name="--presence-penalty <value>" data-type="number" data-required="false" data-desc="Penalizes new tokens based on whether they have appeared in the text so far, increasing the model's likelihood to talk about new topics. Range: -2.0 to 2.0."></x-field>
  <x-field data-name="--frequency-penalty <value>" data-type="number" data-required="false" data-desc="Penalizes new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim. Range: -2.0 to 2.0."></x-field>
  <x-field data-name="--aigne-hub-url <url>" data-type="string" data-required="false" data-desc="Specifies a custom AIGNE Hub service URL for fetching remote models or agents."></x-field>
</x-field-group>

### Input and Output Options

<x-field-group>
  <x-field data-name="--input <text>" data-type="string" data-required="false" data-alias="-i" data-desc="Provides input text to the agent. To read content from a file, use the format '@path/to/file.txt'. Can be specified multiple times."></x-field>
  <x-field data-name="--input-file <path>" data-type="string" data-required="false" data-desc="Provides a file as input to the agent, which is useful for multimodal agents that accept images, documents, etc. Can be specified multiple times."></x-field>
  <x-field data-name="--format <format>" data-type="string" data-required="false" data-desc="Specifies the format of the input data when reading from a file or stdin. Available options: 'text', 'json', 'yaml'."></x-field>
  <x-field data-name="--output <path>" data-type="string" data-required="false" data-alias="-o" data-desc="Saves the agent's output to the specified file instead of printing it to the console."></x-field>
  <x-field data-name="--output-key <key>" data-type="string" data-default="output" data-required="false" data-desc="If the agent's result is an object, this specifies which key's value to save to the output file."></x-field>
  <x-field data-name="--force" data-type="boolean" data-default="false" data-required="false" data-desc="If the output file already exists, this will overwrite it. It will also create parent directories for the output path if they don't exist."></x-field>
</x-field-group>

## Examples

### Start an Interactive Chat

To have a continuous conversation with your agent, use the `--chat` flag.

```bash Start a Chat Session icon=lucide:message-square
aigne run your-agent-name --chat
```

### Send a Single Message

You can send a single piece of text directly from the command line.

```bash Send a Prompt icon=lucide:terminal
aigne run your-agent-name --input "Translate 'hello' to French."
```

### Use a Different AI Model

Override the agent's default model for a single run.

```bash Specify a Model icon=lucide:brain-circuit
aigne run your-agent-name --model openai:gpt-4o-mini --input "What is AIGNE?"
```

### Process a Local File

To have an agent process the contents of a file, use the `@` prefix.

```bash Process a Text File icon=lucide:file-text
aigne run summarizer-agent --input @long-article.txt
```

### Save the Output to a File

Combine input and output flags to create a processing pipeline. This command reads `long-article.txt`, generates a summary, and saves it to `summary.md`.

```bash Save Output icon=lucide:save
aigne run summarizer-agent --input @long-article.txt --output summary.md --force
```