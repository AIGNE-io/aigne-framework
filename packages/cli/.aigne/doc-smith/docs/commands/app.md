# App Command

Manages and runs AIGNE applications, specifically for running apps installed or defined via environment variables.

## Usage

```bash
aigne app <command>
```

## Description

The `app` command group is used internally or for running specific packaged applications. It often works in conjunction with environment variables like `AIGNE_APP_NAME` and `AIGNE_APP_PACKAGE_NAME`.

## Subcommands

- `upgrade`: Upgrade the application to a newer version.

## Usage Context

This command is typically used when the CLI is acting as a runner for a specific installed application. It handles loading the application, managing versions (beta vs. stable), and executing the app's agents.

## Options

- `--model`: Specify the model to use for the application.

---
**Related:** [Run Command](/commands/run.md)
