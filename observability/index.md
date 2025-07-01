# AIGNE Observability

**English** | [中文](index.zh.md)

AIGNE Observability is a powerful visualization tool built on OpenTelemetry, specifically designed for monitoring and analyzing AI Agent data flows. With AIGNE Observability, you can:

* **📊 Real-time Monitoring** - Visualize trace data and call chains, understand Agent runtime status in real-time
* **🔍 Precise Positioning** - Accurately identify AIGNE internal workflows, quickly locate issues
* **🌐 Flexible Deployment** - Support both local CLI and Blocklet deployment methods
* **📈 Comprehensive Observability** - Collect Trace and Log data, providing complete observability
* **🔧 Seamless Integration** - Can be used as a standalone service or integrated into AIGNE runtime

AIGNE Observability makes AI Agent runtime status transparent and visible. Whether you're developing and debugging or monitoring production, you can gain deep insights and analytical capabilities.

## Installing AIGNE Observability

AIGNE Observability is included in the `@aigne/cli` package and can also be used as a standalone Blocklet.

### Install via CLI

```bash
npm install -g @aigne/cli
```

After installation, you can start the observability with the following command:

```bash
aigne observe --port 7890 # Default port can be omitted
```

This command will start the observability service. You can access the observability interface by visiting `http://localhost:7890` in your browser.

![AIGNE Monitor Screenshot](https://www.arcblock.io/image-bin/uploads/bb39338e593abc6f544c12636d1db739.png)

### Install via Blocklet

You can also directly install the [AIGNE Observability Blocklet](https://store.blocklet.dev/blocklets/z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh) to use the observability functionality in a Blocklet environment.

All Blocklets using the AIGNE Framework automatically integrate observability functionality, providing complete observability support without additional configuration.
