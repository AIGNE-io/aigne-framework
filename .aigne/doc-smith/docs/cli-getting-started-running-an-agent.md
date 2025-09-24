# Running an Agent

Now for the fun part! Once you've created your project, you can bring your AI agent to life using the `aigne run` command. This lets you start a conversation, ask it questions, and see how it responds. You can interact with your agent in two main ways: through an interactive chat or by sending a single command.

## Starting an Interactive Chat

This is the most common way to test your agent. It starts a back-and-forth conversation, just like a regular messaging app.

1.  Navigate to your project's directory in your terminal.
2.  Run the following command:

```bash
aigne run
```

After running the command, you'll see a chat prompt appear, waiting for your input:

```text
💬
```

Now, you can type your message and press `Enter` to send it to the agent. The agent will process your request and respond.

Here’s an example of a short conversation:

```text
> aigne run
💬 Hello, who are you?

Hello! I am an AI assistant created with the AIGNE Framework. How can I help you today?

💬 Tell me a fun fact about space.

The footprints on the Moon will be there for 100 million years. Since there is no wind or water on the Moon, nothing will erase them!

💬 /exit
```

To end the chat session, simply type `/exit` and press `Enter`.

## Sending a Single Message

If you don't need a full conversation and just want to send a single instruction, you can use the `--input` (or `-i`) flag. The agent will give one response and then the command will finish.

This is useful for quick tests or for using the agent in automated scripts.

```bash
aigne run --input "What is the capital of France?"
```

The agent's answer will be printed directly to your terminal:

```text
The capital of France is Paris.
```

### Specifying an Agent

If your project contains multiple agents, AIGNE will run the default one. To run a specific agent, just add its name after the `run` command.

```bash
aigne run yourAgentName --input "Tell me a joke."
```

## Using Files as Input

You can also ask your agent to read and process local files. This is incredibly useful for tasks like summarizing documents, analyzing data, or answering questions based on a text.

To pass a file as input, use the `@` symbol followed by the file path within your input message.

For example, let's say you have a file named `report.txt` with the following content:

```text title="report.txt"
The AIGNE Framework simplifies AI agent development. It provides a CLI for creating, running, and managing agents, along with support for various large language models.
```

You can ask your agent to summarize it with this command:

```bash
aigne run --input "Please summarize this document for me: @report.txt"
```

The agent will read the contents of `report.txt` and provide a summary.

## Common Options

The `run` command has several options to customize its behavior. Here are a few of the most common ones:

| Option | Description | Example |
| --- | --- | --- |
| `--path <path>` | Run an agent located in a different directory. | `aigne run --path ../another-agent` |
| `--model <provider:model>` | Specify a different AI model to use for the conversation. | `aigne run --model openai:gpt-4o-mini` |
| `-o, --output <file>` | Save the agent's final response to a file instead of the console. | `aigne run -i "Write a poem" -o poem.txt` |

---

Congratulations! You now know how to run and interact with your AI agent. You can test its skills, have conversations, and see your creation in action.

For a complete list of all available options and more advanced use cases, check out the detailed guide in the [Command Reference: run](./cli-command-reference-run.md).
