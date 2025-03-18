# Contributing to AIGNE Framework

We welcome **all** kinds of contributions - bug fixes, big features, documentation, examples, and more. You don't need to be an AI expert or even a TypeScript developer to help out.

## Checklist

Contributions are made through [pull requests](https://help.github.com/articles/using-pull-requests/).

Before sending a pull request, make sure to do the following:

- Fork the repo and create a feature branch prefixed with `feature/`
- [Lint, typecheck, and format](#lint-typecheck-format) your code
- [Add examples](#examples)

_Please reach out to the AIGNE Framework maintainers before starting work on a large contribution._ Get in touch via [GitHub issues](https://github.com/AIGNE-io/aigne-framework/issues) or [AIGNE Community](https://community.arcblock.io/discussions/boards/aigne).

## Prerequisites

To set up the development environment for AIGNE Framework, you'll need the following installed:

- Install [pnpm](https://pnpm.io/), which we use for package management
- Install [bun](https://bun.sh/), which we use for running examples and unit tests
- Install Node.js (>= 20.x)
- Install dependencies using `pnpm install`

## Running Tests

Run the test suite using:

```bash
pnpm test
```

To run the test suite with coverage, use:

```bash
pnpm test:coverage
```

## Running Examples

Examples are located in the `examples/` directory. To run an example, navigate to each example directory and checkout its README for instructions.

## Lint, Typecheck, Format

Linting and formatting are automated via pre-commit hooks. You can manually run them as follows:

```bash
pnpm lint
```

## Examples

We use the examples for end-to-end testing. For any new feature or integration, please add an example in the [`examples`](./examples/) directory.

## Thank You

If you are considering contributing or have already done so, **thank you**! AIGNE Framework is designed to streamline AI development, and we appreciate all the help we can get. Happy coding!
