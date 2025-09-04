---
labels: ["Reference"]
---

# Contributing

We welcome contributions to `@aigne/cli`! Your help is essential for keeping it great. This guide provides everything you need to get started with development, from setting up your environment to submitting your first pull request.

The project is hosted on GitHub at [AIGNE-io/aigne-framework](https://github.com/AIGNE-io/aigne-framework). If you find a bug or have a feature request, please open an issue on our [issue tracker](https://github.com/AIGNE-io/aigne-framework/issues).

## Development Setup

To get started, first fork the repository on GitHub and then clone it to your local machine:

```bash
git clone https://github.com/<YOUR_USERNAME>/aigne-framework.git
cd aigne-framework/packages/cli
```

This project uses Bun for package management. To install the dependencies, run:

```bash
bun install
```

## Development Workflow

The `package.json` file contains several scripts to help with development. It's important to run these checks before submitting your code to ensure it meets the project's standards.

### Building the Code

To compile the TypeScript source code from the `src/` directory into JavaScript in the `dist/` directory, run:

```bash
bun run build
```

### Running Tests

The project has a comprehensive test suite. To run all tests, including those for the core source code and project templates, use:

```bash
bun run test
```

### Linting

We use the TypeScript compiler (`tsc`) to check for type errors and ensure code quality. To run the linter, use the following command:

```bash
bun run lint
```

Please ensure all tests and lint checks pass before submitting your changes.

## Submitting a Pull Request

Once your changes are ready, follow these steps to submit a pull request:

1.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b my-new-feature
    ```
2.  **Make your changes** and commit them with a descriptive message.
3.  **Push your branch** to your forked repository:
    ```bash
    git push origin my-new-feature
    ```
4.  **Open a pull request** against the `main` branch of the `AIGNE-io/aigne-framework` repository. Provide a clear title and description of the changes you've made.