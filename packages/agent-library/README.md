# @aigne/agent-library

<p align="center">
  <picture>
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" media="(prefers-color-scheme: light)">
    <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/logo.svg" alt="AIGNE Logo" width="400" />
  </picture>
</p>

[![GitHub star chart](https://img.shields.io/github/stars/AIGNE-io/aigne-framework?style=flat-square)](https://star-history.com/#AIGNE-io/aigne-framework)
[![Open Issues](https://img.shields.io/github/issues-raw/AIGNE-io/aigne-framework?style=flat-square)](https://github.com/AIGNE-io/aigne-framework/issues)
[![codecov](https://codecov.io/gh/AIGNE-io/aigne-framework/graph/badge.svg?token=DO07834RQL)](https://codecov.io/gh/AIGNE-io/aigne-framework)
[![NPM Version](https://img.shields.io/npm/v/@aigne/agent-library)](https://www.npmjs.com/package/@aigne/agent-library)
[![Elastic-2.0 licensed](https://img.shields.io/npm/l/@aigne/agent-library)](https://github.com/AIGNE-io/aigne-framework/blob/main/LICENSE)

Collection of agent libraries for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing pre-built agent implementations.

## Introduction

`@aigne/agent-library` is a collection of agent libraries for [AIGNE Framework](https://github.com/AIGNE-io/aigne-framework), providing pre-built agent implementations for developers. The library is built on top of [@aigne/core](https://github.com/AIGNE-io/aigne-framework/tree/main/packages/core), extending the core functionality to simplify complex workflow orchestration.

<picture>
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-libs-dark.png" media="(prefers-color-scheme: dark)">
  <source srcset="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/assets/aigne-libs.png" media="(prefers-color-scheme: light)">
  <img src="https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/aigne-libs.png" alt="AIGNE Arch" />
</picture>

## Features

* **Orchestrator Agent**: Provides OrchestratorAgent implementation for coordinating workflows between multiple agents
* **Task Concurrency**: Supports parallel execution of multiple tasks to improve processing efficiency
* **Planning & Execution**: Automatically generates execution plans and executes them step by step
* **Result Synthesis**: Intelligently synthesizes results from multiple steps and tasks
* **TypeScript Support**: Complete type definitions providing an excellent development experience

## Installation

### Using npm

```bash
npm install @aigne/agent-library @aigne/core
```

### Using yarn

```bash
yarn add @aigne/agent-library @aigne/core
```

### Using pnpm

```bash
pnpm add @aigne/agent-library @aigne/core
```

## Components

The library provides the following components:

### Agent Types

* **[Orchestrator Agent](src/orchestrator/README.md)**: A sophisticated agent pattern that enables autonomous task planning and execution through a three-phase architecture: Planner → Worker → Completer. It breaks down complex objectives into manageable tasks, executes them iteratively, and synthesizes the final results. Perfect for coordinating complex workflows and multi-step tasks.

## License

Elastic-2.0
