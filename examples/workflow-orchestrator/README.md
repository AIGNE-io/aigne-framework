# Workflow Orchestrator Demo

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

This is a demonstration of using [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework) to build an orchestrator workflow using YAML configuration. The orchestrator pattern enables autonomous task planning and execution through a planner-worker-completer architecture.

## Architecture

The orchestrator follows a three-phase workflow:

```mermaid
flowchart LR
    Input([User Objective]) --> Planner
    Planner -->|Next Task| Worker
    Worker -->|Task Result| State[Execution State]
    State --> Planner
    Planner -->|Finished| Completer
    Completer --> Output([Final Response])

    Skills[Skills/Tools] -.->|Available to| Worker

    classDef inputOutput fill:#f9f0ed,stroke:#debbae,stroke-width:2px,color:#b35b39,font-weight:bolder
    classDef agent fill:#F0F4EB,stroke:#C2D7A7,stroke-width:2px,color:#6B8F3C,font-weight:bolder
    classDef resource fill:#E8F4F8,stroke:#4A9EBF,stroke-width:2px,color:#2B5F75,font-weight:bolder

    class Input,Output inputOutput
    class Planner,Worker,Completer agent
    class State,Skills resource
```

**Components:**
- **Planner**: Analyzes the objective and execution state to determine the next task
- **Worker**: Executes assigned tasks using available skills and tools
- **Completer**: Synthesizes all results and provides the final response
- **Execution State**: Tracks task history, results, and progress

## Prerequisites

* [Node.js](https://nodejs.org) (>=20.0) and npm installed on your machine
* An [OpenAI API key](https://platform.openai.com/api-keys) for interacting with OpenAI's services
* Optional dependencies (if running the example from source code):
  * [Bun](https://bun.sh) for running unit tests & examples
  * [Pnpm](https://pnpm.io) for package management

## Quick Start

The orchestrator is configured using YAML files. This example uses:
- [aigne.yaml](./aigne.yaml) - Main configuration file
- [agents/orchestrator.yaml](./agents/orchestrator.yaml) - Orchestrator agent definition
- [agents/objective.md](./agents/objective.md) - Objective prompt template
- [agents/planner.md](./agents/planner.md) - Custom planner instructions

### Run with npx (No Installation Required)

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your API key
export GEMINI_API_KEY=YOUR_GEMINI_API_KEY # Or use Gemini

# Run the orchestrator
npx -y @aigne/example-workflow-orchestrator
```

### Connect to an AI Model

As an example, running `npx -y @aigne/example-workflow-orchestrator --chat` requires an AI model. If this is your first run, you need to connect one.

![run example](./run-example.png)

- Connect via the official AIGNE Hub

Choose the first option and your browser will open the official AIGNE Hub page. Follow the prompts to complete the connection. If you're a new user, the system automatically grants 400,000 tokens for you to use.

![connect to official aigne hub](../images/connect-to-aigne-hub.png)

- Connect via a self-hosted AIGNE Hub

Choose the second option, enter the URL of your self-hosted AIGNE Hub, and follow the prompts to complete the connection. If you need to set up a self-hosted AIGNE Hub, visit the Blocklet Store to install and deploy it: [Blocklet Store](https://store.blocklet.dev/blocklets/z8ia3xzq2tMq8CRHfaXj1BTYJyYnEcHbqP8cJ?utm_source=www.arcblock.io&utm_medium=blog_link&utm_campaign=default&utm_content=store.blocklet.dev#:~:text=%F0%9F%9A%80%20Get%20Started%20in%20Minutes).

![connect to self hosted aigne hub](../images/connect-to-self-hosted-aigne-hub.png)

- Connect via a third-party model provider

Using OpenAI as an example, you can configure the provider's API key via environment variables. After configuration, run the example again:

```bash
export OPENAI_API_KEY="" # Set your OpenAI API key here
```
For more details on third-party model configuration (e.g., OpenAI, DeepSeek, Google Gemini), see [.env.local.example](./.env.local.example).

After configuration, run the example again.

### Debugging

The `aigne observe` command starts a local web server to monitor and analyze agent execution data. It provides a user-friendly interface to inspect traces, view detailed call information, and understand your agent’s behavior during runtime. This tool is essential for debugging, performance tuning, and gaining insight into how your agent processes information and interacts with tools and models.

Start the observation server.

![aigne-observe-execute](../images/aigne-observe-execute.png)

View a list of recent executions.

![aigne-observe-list](../images/aigne-observe-list.png)

## Installation

### Clone the Repository

```bash
git clone https://github.com/AIGNE-io/aigne-framework
```

### Install Dependencies

```bash
cd aigne-framework/examples/workflow-orchestrator

pnpm install
```

### Setup Environment Variables

Setup your OpenAI API key in the `.env.local` file:

```bash
OPENAI_API_KEY="" # Set your OpenAI API key here
```

When running Puppeteer inside a Docker container, set the following environment variable:

```
DOCKER_CONTAINER="true"
```

This ensures Puppeteer configures itself correctly for a Docker environment, preventing potential compatibility issues.

#### Using Different Models

You can use different AI models by setting the `MODEL` environment variable along with the corresponding API key. The framework supports multiple providers:

* **OpenAI**: `MODEL="openai:gpt-4.1"` with `OPENAI_API_KEY`
* **Anthropic**: `MODEL="anthropic:claude-3-7-sonnet-latest"` with `ANTHROPIC_API_KEY`
* **Google Gemini**: `MODEL="gemini:gemini-2.0-flash"` with `GEMINI_API_KEY`
* **AWS Bedrock**: `MODEL="bedrock:us.amazon.nova-premier-v1:0"` with AWS credentials
* **DeepSeek**: `MODEL="deepseek:deepseek-chat"` with `DEEPSEEK_API_KEY`
* **OpenRouter**: `MODEL="openrouter:openai/gpt-4o"` with `OPEN_ROUTER_API_KEY`
* **xAI**: `MODEL="xai:grok-2-latest"` with `XAI_API_KEY`
* **Ollama**: `MODEL="ollama:llama3.2"` with `OLLAMA_DEFAULT_BASE_URL`

For detailed configuration examples, please refer to the `.env.local.example` file in this directory.

### Run from Source

```bash
cd examples/workflow-orchestrator
pnpm start
```

You can pass custom messages to the orchestrator:

```bash
# Pass message via command line
pnpm start -- -m "Analyze the project structure"

# Or use YAML input
pnpm start -- --input-yaml '{ message: "Generate a README for this project" }'
```

## Configuration

### Main Configuration (aigne.yaml)

```yaml
#!/usr/bin/env aigne

model: aignehub/google/gemini-2.5-pro
agents:
  - agents/orchestrator.yaml
```

### Orchestrator Configuration (agents/orchestrator.yaml)

```yaml
type: "@aigne/agent-library/orchestrator"
name: orchestrator
input_schema:
  type: object
  properties:
    message:
      type: string
      description: (Optional) User's instruction
  required: []

# Specify the objective for the orchestrator agent
objective:
  url: objective.md

# Custom planner agent can be defined here
planner:
  type: ai
  instructions:
    url: planner.md

# Custom worker agent (optional)
# worker:
#   type: ai
#   instructions:
#     url: path/to/worker_instructions.md

# Custom completer agent (optional)
# completer:
#   type: ai
#   instructions:
#     url: path/to/completer_instructions.md

# State management configuration
state_management:
  max_iterations: 5              # Maximum planning-execution iterations
  max_tokens: 100000            # Optional: limit total tokens for state management
  keep_recent: 20               # Optional: keep only N most recent states in memory

# Agent File System configuration
afs:
  modules:
    - module: local-fs
      options:
        name: workspace
        localPath: .
        description: Workspace directory for the orchestrator agent.
```

### Objective Template (agents/objective.md)

```markdown
Explore the project directory `/modules/workspace/` structure and generate a project summary report in Markdown format.

- Ignore directories like node_modules, .git, dist, build, etc.
- Provide accurate information based on actual file contents

{% if message %}
## User Instructions
{{ message }}
{% endif %}
```

### Custom Planner Instructions (agents/planner.md)

The planner is responsible for iterative task planning. See [agents/planner.md](./agents/planner.md) for the full custom planner prompt that enables autonomous exploration and task decomposition.

### Key Features

1. **YAML-based Configuration**: Define your orchestrator workflow declaratively
2. **Customizable Components**: Override planner, worker, or completer with custom instructions
3. **State Management**: Control iteration limits and memory usage
4. **Agent File System**: Shared storage accessible to all agent components
5. **Template Support**: Use Jinja2-style templates in objective prompts

## License

This project is licensed under the MIT License.
