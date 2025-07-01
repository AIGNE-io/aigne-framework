# AIGNE Monitor

**English** | [中文](index.zh.md)

AIGNE Monitor is a powerful visualization tool built on OpenTelemetry, specifically designed for monitoring and analyzing AI Agent data flows. With AIGNE Monitor, you can:

* **📊 Real-time Monitoring** - Visualize trace data and call chains, understand Agent runtime status in real-time
* **🔍 Precise Positioning** - Accurately identify AIGNE internal workflows, quickly locate issues
* **🌐 Flexible Deployment** - Support both local CLI and Blocklet deployment methods
* **📈 Comprehensive Observability** - Collect Trace and Log data, providing complete observability
* **🔧 Seamless Integration** - Can be used as a standalone service or integrated into AIGNE runtime

AIGNE Monitor makes AI Agent runtime status transparent and visible. Whether you're developing and debugging or monitoring production, you can gain deep insights and analytical capabilities.

## Installing AIGNE Monitor

AIGNE Monitor is included in the `@aigne/cli` package and can also be used as a standalone Blocklet.

### Install via CLI

```bash
npm install -g @aigne/cli
```

After installation, you can start the monitor with the following command:

```bash
aigne observe
```

### Install via Blocklet

You can also directly install the [AIGNE Observability Blocklet](https://store.blocklet.dev/blocklets/z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh) to use the monitor functionality in a Blocklet environment.

## Quick Start

### Basic Operations

* [**📊 Using the Monitor**](observe.md) - Start and use the monitor service
* [**🔧 Running Examples**](observe.md#running-example-applications) - Run example applications to see monitoring effects

### Starting the Monitor

Use the following command to quickly start AIGNE Monitor:

```bash
aigne observe
```

After successful startup, visit `http://localhost:7890` in your browser to view the monitor interface.

## Key Features

### Real-time Trace Monitoring

* **Call Chain Visualization** - Clearly display call relationships and data flow between Agents
* **Performance Metrics** - Monitor key performance indicators like response time and throughput
* **Error Tracking** - Quickly identify and locate runtime errors

### Data Collection and Analysis

* **Trace Data** - Collect complete request tracing information
* **Log Data** - Aggregate and analyze application logs
* **OpenTelemetry Compatible** - Support standard observability protocols

### Flexible Deployment Options

* **Local Development** - Quick startup via AIGNE CLI
* **Production Environment** - Deploy as Blocklet to production environment
* **Integration Mode** - Automatically integrate into AIGNE runtime

## Use Cases

### Development and Debugging

When developing AI Agents, use the monitor to:

* View Agent execution flow in real-time
* Quickly locate code issues and performance bottlenecks
* Verify interaction logic between Agents

### Production Monitoring

In production environments, the monitor helps you:

* Monitor Agent runtime health status
* Analyze user request processing flow
* Timely discover and resolve system issues

### Performance Optimization

Through monitor data, you can:

* Identify performance bottlenecks and optimization opportunities
* Analyze resource usage
* Optimize Agent response speed

## Blocklet Integration

All Blocklets using the AIGNE Framework automatically integrate monitor functionality, providing complete observability support without additional configuration.

### Auto-integration Features

* **Zero-configuration Startup** - Monitor automatically enabled in Blocklet environment
* **Unified Interface** - Seamlessly integrated with Blocklet management interface
* **Data Persistence** - Automatically save and manage monitoring data
* **Permission Control** - Based on Blocklet user permission system
