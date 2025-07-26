# CLI Advanced Configuration

Master AIGNE CLI with advanced configuration options and environment variables.

```bash
# Set up environment variables for different providers
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
export GEMINI_API_KEY="AI..."
export DEEPSEEK_API_KEY="sk-..."
export XAI_API_KEY="xai-..."

# Set default model globally
export MODEL="anthropic:claude-3-5-sonnet-latest"

# Advanced model parameters
aigne run \
  --model openai:gpt-4o \
  --temperature 0.7 \
  --top-p 0.9 \
  --presence-penalty 0.1 \
  --frequency-penalty 0.2 \
  --log-level DEBUG

# Input/Output management
aigne run \
  --input "Analyze this data" \
  --format json \
  --output results.json \
  --output-key analysis \
  --force

# Complex workflow automation
#!/bin/bash
export OPENAI_API_KEY=$API_KEY
export MODEL="openai:gpt-4o"

# Process multiple inputs
for file in data/*.txt; do
  aigne run \
    --input "$(cat $file)" \
    --output "processed/$(basename $file .txt).json" \
    --output-key result \
    --force
done
```

## Twitter Post #1

⚙️ Master AIGNE CLI like a pro!

Advanced features unlock power:
🔑 Environment variable management 🎛️ Fine-tuned model parameters 📁 Batch processing workflows 💾 Flexible I/O handling

From simple chats to production automation!

#AIGNE #ArcBlock #CLI

## Twitter Post #2

This example shows advanced CLI configuration:

• Environment variables for multiple providers
• Fine-tuned model parameters
• Batch processing workflows
• Flexible input/output handling

CLI mastery unlocked! ⚙️

## Twitter Post #3

🌟 https://github.com/aigne-io/aigne-framework

#AIGNE #ArcBlock #CLI
