---
labels: ["Reference"]
---

# Contributing

We welcome contributions to `@aigne/cli`! Your help is essential for keeping it great. This guide provides everything you need to get started with development, from setting up your environment to submitting your first pull request.

The project is hosted on GitHub at [AIGNE-io/aigne-framework](https://github.com/AIGNE-io/aigne-framework). If you find a bug or have a feature request, please open an issue on our [issue tracker](https://github.com/AIGNE-io/aigne-framework/issues).

## Contribution Workflow

The following diagram illustrates the typical workflow for contributing to the project.

```d2
direction: down

GitHub-Repo: {
  label: "AIGNE-io/aigne-framework"
  shape: package
}

Your-Fork: {
  label: "<YOUR_USERNAME>/aigne-framework"
  shape: package
}

Local-Machine: {
  label: "Local Machine"
  shape: rectangle

  New-Branch: {
    label: "Feature Branch"
    shape: rectangle
  }

  Develop: {
    label: "Code & Commit"
    shape: rectangle
  }

  Checks: {
    label: "Run Tests & Lint"
    shape: rectangle
  }
}

Pull-Request: {
  label: "Pull Request"
  shape: rectangle
}

Review-Merge: {
  label: "Code Review & Merge"
  shape: rectangle
}

GitHub-Repo -> Your-Fork: "1. Fork"
Your-Fork -> Local-Machine: "2. Clone"
Local-Machine -> Local-Machine.New-Branch: "3. Create branch"
Local-Machine.New-Branch -> Local-Machine.Develop: "4. Make changes"
Local-Machine.Develop -> Local-Machine.Checks: "5. Validate changes"
Local-Machine.Checks -> Your-Fork: "6. Push changes"
Your-Fork -> Pull-Request: "7. Create PR"
Pull-Request -> GitHub-Repo: "Submit to main branch"
GitHub-Repo -> Review-Merge: "8. Review & Merge"

```

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

## Development Scripts

The `package.json` file contains several scripts to help with development. It's important to run these checks before submitting your code to ensure it meets the project's standards.

| Script | Description |
|---|---|
| `bun run build` | Compiles the TypeScript source from `src/` into JavaScript in `dist/`. |
| `bun run test` | Runs the complete test suite for source code and templates. |
| `bun run lint` | Checks for type errors using the TypeScript compiler (`tsc`). |
| `bun run clean` | Removes the `dist` and `coverage` directories. |

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