---
labels: ["Reference"]
---

# Running Remote Agents

The AIGNE CLI can execute agents from remote locations, not just from local directories. This feature allows you to run agents directly from a URL pointing to a compressed project archive (e.g., a `.tar.gz` file). It simplifies sharing, testing, and integrating agents into automated workflows without needing to clone a repository first.

## Basic Usage

The `run` command is used for this purpose by providing a URL instead of a local file path. The remote source must be a publicly accessible tarball archive.

```bash
# Run an agent from a remote URL
aigne run https://example.com/path/to/my-aigne-project.tar.gz
```

Once the agent is downloaded and initialized, the CLI will start an interactive chat session, just as it would with a local agent.

![Running an agent in chat mode](../assets/run/run-default-template-project-in-chat-mode.png)

## How It Works

When you provide a URL, the CLI performs the following steps behind the scenes:

1.  **Download**: It fetches the compressed package from the specified URL.
2.  **Cache**: It creates a local directory to store the downloaded content. By default, this is located in your home directory under `~/.aigne/`, with a path derived from the URL's hostname and path (e.g., `~/.aigne/example.com/path/to/project/`).
3.  **Extract**: The tarball is uncompressed into the cache directory.
4.  **Execute**: The CLI then initializes and runs the agent from the extracted files, just as it would with a local project.

This process ensures that subsequent runs of the same URL can use the local cache, avoiding repeated downloads.

```d2
direction: down

User: { 
  shape: person 
}

AIGNE-CLI: {
  label: "AIGNE CLI"
  shape: rectangle
}

Remote-Server: {
  label: "Remote Server\n(e.g., GitHub)"
  shape: cylinder
}

Local-Cache: {
  label: "Local Filesystem\n(~/.aigne/cache)"
  shape: stored_data
}

AIGNE-Engine: {
  label: "AIGNE Engine"
  shape: rectangle
}

User -> AIGNE-CLI: "1. aigne run <URL>"
AIGNE-CLI -> Remote-Server: "2. Download package"
Remote-Server -> AIGNE-CLI: "3. Returns tarball"
AIGNE-CLI -> Local-Cache: "4. Extract package to cache"
AIGNE-CLI -> AIGNE-Engine: "5. Load agent from cache"
AIGNE-Engine -> User: "6. Start interactive session"

```

## Practical Example: Running from a GitHub Repository

You can run an agent directly from a GitHub repository's release archive or a snapshot of a specific branch or tag. GitHub and other Git platforms provide URLs to download a repository snapshot as a `.tar.gz` file.

For instance, to run an agent from the `v1.2.0` tag of a public GitHub repository:

```bash
aigne run https://github.com/AIGNE-io/example-agent/archive/refs/tags/v1.2.0.tar.gz
```

This command downloads the `v1.2.0` version of the `example-agent` repository, caches it locally, and starts the default agent defined within that project.

## Combining with Other Options

All other options for the `run` command are also available when running from a URL. You can specify a particular agent to run or override the model configuration.

```bash
# Run a specific agent from the remote package
aigne run <URL> --entry-agent myAgent

# Run a remote agent using a different model
aigne run <URL> --model openai:gpt-4o-mini
```

For a complete list of available flags and options, see the [`aigne run` command reference](./command-reference-run.md).
