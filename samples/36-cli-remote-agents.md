# CLI Remote Agent Execution

Run AIGNE agents directly from remote repositories without local setup.

```bash
# Run agent from GitHub repository
aigne run --path https://github.com/username/my-aigne-project

# Run with custom cache directory
aigne run --path https://github.com/username/agents --cache-dir ./temp-cache

# Run specific agent from remote repo
aigne run --path https://github.com/username/multi-agent-project --entry-agent researcher

# Run remote agent with custom model
aigne run --path https://github.com/username/coding-assistant \
  --model anthropic:claude-3-5-sonnet-latest \
  --chat

# Run with input piping from remote
echo "Analyze this code for bugs" | aigne run --path https://github.com/username/code-reviewer

# Combine remote execution with output saving
aigne run --path https://github.com/username/report-generator \
  --input "Generate monthly report" \
  --output monthly-report.md
```

## Twitter Post #1

🌐 Run AI agents from anywhere with AIGNE CLI!

Revolutionary remote execution:
📦 No local installation needed 🔗 Direct GitHub integration ⚡ Instant agent deployment 🎯 Share agents globally

Clone, run, collaborate - all in one command!

#AIGNE #ArcBlock #CLI

## Twitter Post #2

This example shows remote agent execution:

• Use --path flag with GitHub URLs
• Run agents without local installation
• Combine with custom models and parameters
• Perfect for sharing and collaboration

Remote AI execution made simple! 🌐

## Twitter Post #3

🌟 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #CLI
