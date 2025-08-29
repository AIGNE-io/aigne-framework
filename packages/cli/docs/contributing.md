---
labels: ["Reference"]
---

# Contributing

Contributions to `@aigne/cli` are welcome. Whether you're fixing a bug, improving documentation, or adding a new feature, your help is appreciated. This guide provides the necessary steps to get your development environment set up and submit your contributions.

The `@aigne/cli` package is part of the `aigne-framework` monorepo, hosted on GitHub. Before making significant changes, it's a good practice to first open an issue to discuss your proposal.

- **Issues Tracker**: [https://github.com/AIGNE-io/aigne-framework/issues](https://github.com/AIGNE-io/aigne-framework/issues)
- **Source Code**: [https://github.com/AIGNE-io/aigne-framework](https://github.com/AIGNE-io/aigne-framework)

## Development Setup

To get started, you'll need to fork the repository, clone it to your local machine, and install the dependencies.

1.  **Fork & Clone the Repository**

    First, fork the `AIGNE-io/aigne-framework` repository on GitHub. Then, clone your fork to your local machine:

    ```bash
    git clone https://github.com/YOUR_USERNAME/aigne-framework.git
    cd aigne-framework
    ```

2.  **Install Dependencies**

    The project uses a monorepo structure. Install all dependencies from the root of the repository.

    ```bash
    npm install
    ```

3.  **Navigate to the CLI Package**

    All work for `@aigne/cli` will be done within its specific package directory.

    ```bash
    # Assuming the package is in a 'packages' directory
    cd packages/cli 
    ```

## Building and Testing

The project includes several scripts to help with development, including building, linting, and testing.

### Building the Code

The source code is written in TypeScript and needs to be compiled into JavaScript. The compiled output is placed in the `dist/` directory.

To build the project, run the following command from the `@aigne/cli` package directory:

```bash
npm run build
```

### Linting

We use the TypeScript compiler (`tsc`) to perform static analysis and check for type errors. To run the linter:

```bash
npm run lint
```

### Running Tests

The project uses `bun` for running source tests and `node`'s native test runner for template tests. You can run all tests at once or target specific test suites.

To run the complete test suite:

```bash
npm run test
```

To run only the source code tests:

```bash
npm run test:src
```

To run only the tests for the project templates:

```bash
npm run test:templates
```

## Submitting Changes

Once your changes are ready, follow these steps to submit a pull request.

1.  **Create a New Branch**

    Create a descriptive branch for your feature or bug fix.

    ```bash
    git checkout -b feature/my-new-feature
    ```

2.  **Commit Your Changes**

    Make your changes and commit them with a clear and concise message.

3.  **Push and Open a Pull Request**

    Push your branch to your forked repository and open a pull request against the `main` branch of the official `AIGNE-io/aigne-framework` repository. Provide a detailed description of the changes in your pull request.