---
labels: ["Reference"]
---

# Contributing

We're thrilled that you're interested in contributing to `@aigne/cli`! Your help is invaluable in making the AIGNE development experience better for everyone. Whether you're fixing a bug, proposing a new feature, or improving documentation, your contributions are welcome.

This guide provides instructions for setting up your development environment, running tests, and submitting your changes.

## Getting Started

The `@aigne/cli` package is part of the `aigne-framework` monorepo. To get started, you'll need to clone the main repository and install its dependencies.

### 1. Clone the Repository

First, clone the `aigne-framework` repository from GitHub to your local machine:

```bash Git Clone icon=logos:git-icon
git clone https://github.com/AIGNE-io/aigne-framework.git
cd aigne-framework
```

### 2. Install Dependencies

We use `bun` as the primary package manager for the project. Install all the necessary dependencies from the root of the monorepo:

```bash Bun Install icon=logos:bun
bun install
```

This will install all dependencies for every package in the monorepo, including `@aigne/cli`.

## Development Workflow

All development commands for the CLI should be run from within its package directory: `packages/cli`.

### Building the Code

To compile the TypeScript source code into JavaScript, run the build command. This uses the `tsconfig.build.json` configuration and outputs the compiled files to the `dist/` directory.

```bash Build Command icon=lucide:hammer
bun run build
```

### Linting and Type Checking

We use the TypeScript compiler to perform static analysis and ensure code quality. To check for any type errors without emitting JavaScript files, run the lint command:

```bash Lint Command icon=lucide:check-circle
bun run lint
```

### Running Tests

We have a comprehensive test suite to ensure the CLI functions correctly. The following scripts are available for testing:

| Command | Description |
|---|---|
| `bun run test` | Executes the complete test suite, including tests for the CLI source (`test:src`) and the project templates (`test:templates`). |
| `bun run test:src` | Runs only the unit and integration tests for the CLI's core functionality. |
| `bun run test:templates` | Runs tests specifically for the project templates scaffolded by `aigne create`. |
| `bun run test:coverage` | Runs the entire test suite and generates a code coverage report. |

It's important to ensure all tests pass before submitting a pull request.

### Code Style

We use [Prettier](https://prettier.io/) to maintain a consistent code style across the project. Please ensure your code is formatted before committing your changes. Most editors can be configured to format files automatically on save.

## Submitting a Pull Request

Once you've made your changes and verified them with the build and test scripts, you're ready to submit a pull request.

1.  **Fork the repository** on GitHub.
2.  **Create a new branch** for your feature or bug fix: `git checkout -b your-feature-name`.
3.  **Commit your changes** with a clear and descriptive commit message.
4.  **Push your branch** to your fork: `git push origin your-feature-name`.
5.  **Open a pull request** from your fork to the `main` branch of the `AIGNE-io/aigne-framework` repository.
6.  **Provide a detailed description** of your changes in the pull request, referencing any related issues from the issue tracker.

We'll review your contribution as soon as possible. Thank you for helping us improve AIGNE!