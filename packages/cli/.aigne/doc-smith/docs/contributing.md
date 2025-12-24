# Contributing Guide

Thank you for your interest in contributing to `@aigne/cli`! This guide will help you set up your development environment.

## Prerequisites

- **Bun**: This project uses [Bun](https://bun.sh/) for testing and running scripts.
- **Node.js**: Required for building and running the CLI.

## Development Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/AIGNE-io/aigne-framework.git
    cd aigne-framework/packages/cli
    ```

2.  **Install dependencies**:
    ```bash
    bun install
    # or
    npm install
    ```

## Build Scripts

The `package.json` provides several scripts for development:

-   `npm run build`: Compiles the TypeScript code to JavaScript (`dist/`).
-   `npm run clean`: Removes `dist` and coverage directories.
-   `npm run lint`: Runs type checking (`tsc --noEmit`).

## Running Tests

We use `bun` for running source tests and `node --test` for template tests.

-   **Run all tests**:
    ```bash
    npm test
    ```
-   **Run source tests only**:
    ```bash
    npm run test:src
    ```
-   **Run template tests only**:
    ```bash
    npm run test:templates
    ```

## Project Structure

-   `src/`: Source code for the CLI.
    -   `commands/`: Implementation of individual commands.
    -   `cli.ts`: Main entry point.
-   `test/`: Unit and integration tests.
-   `templates/`: Project templates used by `aigne create`.

---
**Related:** [Command Reference](/commands/index.md)
