# Run Agent

Use AIGNE CLI to run your agents.

## `aigne run` Command

Run an agent in the current directory or a specified directory.

```bash
aigne run [options]
```

### Options

* `--path <path>`: Path to the agent directory (defaults to current directory `.`) or URL pointing to a project in AIGNE Studio
* `--entry-agent <agent>`: Name of the agent to run (defaults to the first agent found)
* `--cache-dir <directory>`: Directory for downloaded packages (when using URL), defaults to `~/.aigne/xxx`
* `--interactive`: Run chat loop in terminal (defaults to false, i.e., one-shot mode)
* `--input -i <input>`: Input for the agent
* `--model <provider[:model]>`: AI model to use, format 'provider\[:model]' where model is optional. Examples: 'openai' or 'openai:gpt-4o-mini'. Available providers: openai, anthropic, bedrock, deepseek, gemini, ollama, openrouter, xai (defaults to openai)
* `--temperature <temperature>`: Model temperature parameter (controls randomness, higher values produce more random output). Range: 0.0-2.0, 0.0 for most deterministic output.
* `--top-p <top-p>`: Model Top P (nucleus sampling) parameter (controls diversity). Range: 0.0-1.0, lower values restrict to more likely tokens.
* `--presence-penalty <presence-penalty>`: Model presence penalty parameter (penalizes repeated tokens). Range: -2.0 to 2.0, positive values reduce repetition.
* `--frequency-penalty <frequency-penalty>`: Model frequency penalty parameter (penalizes token usage frequency). Range: -2.0 to 2.0, positive values reduce repeated token usage.
* `--log-level <log-level>`: Verbose log level for debugging information. Options: "debug", "info", "warn", "error".
* `--help`: Show command help

### Basic Usage Examples

#### Run agent in current directory

```bash
aigne run
```

#### Run agent in specific directory

```bash
aigne run ./my-agents
```

#### Run specific agent

```bash
aigne run --entry-agent myAgent
```

#### Run agent in chat mode

```bash
aigne run --interactive
```

#### Run agent with specific input

```bash
aigne run --input "Hello, please help me analyze this problem"
```

### Running Agents from AIGNE Studio

You can run agents directly from AIGNE Studio project URLs:

```bash
aigne run https://www.aigne.io/projects/xxx/xxx.tgz
```

#### Complete Steps to Run Agents from AIGNE Studio

https://github.com/user-attachments/assets/f528d1a1-31d1-48e5-b89e-e3d555c53649

1. **Create a project in AIGNE Studio:**
   * Log in to [AIGNE Studio](https://www.aigne.io)
   * Click to create a new project
   * Add required Agents to the project

2. **Get CLI command:**
   * In the project page, click the settings icon in the top right corner
   * Find the "Integration" tab in the settings menu
   * In the AIGNE CLI section, click "Generate Link" button if no link exists
   * Copy the generated `aigne run` command (format like `aigne run https://www.aigne.io/projects/xxx/xxx.tgz?secret=yyy&hash=zzz`)

3. **Run the command:**
   * Open terminal
   * Paste and run the copied command
   * The system will automatically download the project and its agents and start the chat loop

### Model Configuration Examples

#### Using different AI models

```bash
# Use OpenAI GPT-4
aigne run --model openai:gpt-4

# Use Anthropic Claude
aigne run --model anthropic:claude-3-sonnet

# Use local Ollama model
aigne run --model ollama:llama2
```

#### Adjusting model parameters

```bash
# Set lower temperature for more deterministic output
aigne run --temperature 0.2

# Set higher temperature for more creative output
aigne run --temperature 0.8

# Combine multiple parameters
aigne run --model openai:gpt-4 --temperature 0.5 --top-p 0.9
```

### Debugging and Logging

Use different log levels to get more debugging information:

```bash
# Enable debug logging
aigne run --log-level debug

# Show only error messages
aigne run --log-level error
```
