<p align="center">
  <img src="../../logo.svg" alt="AIGNE Logo" width="400"/>
</p>

<p align="center">
  🇬🇧 <a href="./README.md">English</a> | 🇨🇳 <a href="./README.zh.md">中文</a>
</p>

# AIGNE Observability

A visual tool for monitoring Agent data flow, built on OpenTelemetry. Supports collection of both Trace and Log data. Can be used as a standalone service or integrated into the AIGNE runtime (AIGNE has this module integrated by default).

![](./screenshots/list.png)
![](./screenshots/detail.png)

***

## ✨ Features

* 📊 Real-time visualization of trace data and call chains
* 🔍 Accurately pinpoint AIGNE internal workflows
* ☁️ Supports both local [AIGNE CLI](https://www.npmjs.com/package/@aigne/cli) and [Blocklet](https://store.blocklet.dev/blocklets/z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh) deployment

***

## 🛠 Installation & Usage

You can use AIGNE Observability in two ways: **AIGNE CLI** or **Blocklet**.

### Using AIGNE CLI

```bash
npm install -g @aigne/cli

# Start the observability dashboard
aigne observe
```

After starting, you can access the observability interface at `http://localhost:7890` in your browser.

### Running Examples

When running example AIGNE applications, you can view the Agents' data flow and call chains in real-time in the AIGNE Observability dashboard. Run the chat-bot example as follows:

```bash
export OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Set your OpenAI API key

# Run in one-shot mode
npx -y @aigne/example-chat-bot

# Or add the `--chat` parameter to enter interactive chat mode
npx -y @aigne/example-chat-bot --chat
```

View [more examples](../../examples/README.md)

### Using as a Blocklet

After installing the [AIGNE Observability Blocklet](https://store.blocklet.dev/blocklets/z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh), you can use AIGNE Observability directly in the Blocklet environment. All Blocklets using the AIGNE Framework will automatically integrate the observability functionality.
