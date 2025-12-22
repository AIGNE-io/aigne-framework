# AFS Context for Prompt Builder

`$afs` is a built-in context variable provided by the AIGNE framework's Prompt Builder for dynamically accessing AFS (Agentic File System) data and functionality within prompt templates. The template engine uses **Nunjucks** for rendering.

## Available Properties and Methods

| Type | Name | Description |
|------|------|-------------|
| **Property** | `$afs.enabled` | Boolean indicating whether AFS is enabled |
| **Property** | `$afs.description` | Static description text for AFS |
| **Property** | `$afs.modules` | Promise returning list of mounted modules (name, path, description) |
| **Property** | `$afs.histories` | Promise returning conversation history |
| **Property** | `$afs.skills` | Promise returning list of AFS-provided skills |
| **Method** | `$afs.list(path, options?)` | List directory contents (async) |
| **Method** | `$afs.read(path)` | Read file content (async) |
| **Method** | `$afs.search(path, query, options?)` | Search file contents (async) |

## Template Syntax Examples

### 1. Direct Property Access

```jinja2
{{ $afs.description }}
```

### 2. Property Access with Pipe Filters

```jinja2
{{ $afs.modules | yaml.stringify }}
{{ $afs.histories | yaml.stringify }}
```

### 3. Method Calls with Arguments

```jinja2
{{ $afs.list(workspace, { maxChildren: 50, maxDepth: 10, format: 'tree' }) | yaml.stringify }}
{{ $afs.read('/modules/doc-smith/output/document_structure.yaml') | yaml.stringify }}
{{ $afs.search(workspace, "search query", {preset: "predict-resources"}) | yaml.stringify }}
```

### 4. Conditional Statements

```jinja2
{% if $afs.enabled %}
## AFS Related Content
{{ $afs.description }}
{% endif %}
```

## Method Reference

### `$afs.list(path, options?)`

List directory contents with tree or list format.

**Parameters:**
- `path`: Absolute directory path to browse
- `options` (optional):
  - `maxChildren`: Maximum number of children per directory
  - `maxDepth`: Tree depth limit
  - `format`: Output format (`'tree'` or `'list'`, default: `'tree'`)
  - `disableGitignore`: Disable .gitignore filtering
  - `preset`: Name of a registered preset (see [Preset System](#preset-system))

**Example:**
```jinja2
{{ $afs.list('/modules/workspace', { maxChildren: 50, maxDepth: 10, format: 'tree' }) | yaml.stringify }}
```

### `$afs.read(path)`

Read complete file contents.

**Parameters:**
- `path`: Absolute file path to read

**Example:**
```jinja2
{{ $afs.read('/modules/config/settings.yaml') | yaml.stringify }}
```

### `$afs.search(path, query, options?)`

Search file contents by keywords.

**Parameters:**
- `path`: Absolute directory path to search in
- `query`: Search keywords or patterns
- `options` (optional):
  - `caseSensitive`: Case-sensitive search (default: false)
  - `limit`: Maximum results to return
  - `preset`: Name of a registered preset (see [Preset System](#preset-system))

**Example:**
```jinja2
{{ $afs.search(workspace, "README", { limit: 5 }) | yaml.stringify }}
{{ $afs.search(workspace, "find useful files", { preset: "predict-resources" }) | yaml.stringify }}
```

## Preset System

Both `$afs.list()` and `$afs.search()` support a powerful preset system that allows customizing result processing through a pipeline of stages.

### Preset Configuration (YAML)

Presets are configured in the agent's `afs.context` section:

```yaml
afs:
  modules:
    - local-fs
    - history
  context:
    search:
      presets:
        predict-resources:
          select:
            agent:
              type: ai
              instructions: |
                Based on the query, predict and return the most relevant file paths.
              output_schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: string
          per:
            agent:
              type: ai
              instructions: |
                Summarize the content of this file.
          dedupe:
            agent:
              type: ai
              instructions: |
                Combine and deduplicate the results.
    list:
      presets:
        summary-view:
          select:
            agent: ./select-agent.yaml
```

### Preset Pipeline Stages

| Stage | Description | Input | Output |
|-------|-------------|-------|--------|
| `select` | Custom selection logic | `{ path, query }` | `{ data: string[] }` (file paths) |
| `per` | Per-entry transformation | `{ data: AFSEntry }` | `{ data: unknown }` |
| `dedupe` | Aggregation/deduplication | `{ data: unknown[] }` | `{ data: unknown }` |
| `format` | Output formatting | `{ data: unknown }` | `{ data: unknown }` |
| `view` | View template name | - | - |

### Pipeline Flow

```
Input → select → [read entries] → per (each) → dedupe → format → Output
```

### Stage Agent Configuration

Each stage references an agent that processes the data:

```yaml
# Inline agent definition
select:
  agent:
    type: ai
    instructions: "..."
    output_schema:
      type: object
      properties:
        data:
          type: array
          items:
            type: string

# Reference to external agent file
per:
  agent: ./per-processor.yaml

# Reference by URL
dedupe:
  agent:
    url: ./dedupe-agent.yaml
```

### Usage in Templates

```jinja2
{# Use a registered preset for search #}
{{ $afs.search(workspace, "find configuration files", { preset: "predict-resources" }) | yaml.stringify }}

{# Use a registered preset for list #}
{{ $afs.list(workspace, { preset: "summary-view" }) | yaml.stringify }}
```

### Implementing a Select Agent

The `select` stage is the most commonly customized stage. It receives `{ path, query }` as input and must return `{ data: string[] }` containing file paths to process.

#### Example: predict-resources Agent

Here's a complete example of a select agent that predicts relevant files for a documentation task:

**Agent Definition (predict-resources/index.yaml):**

```yaml
type: ai
name: predictResources
description: Predict necessary resources for documentation task

instructions:
  url: ./instructions.md

input_schema:
  type: object
  properties:
    query:
      type: string
      description: The search query or objective
    path:
      type: string
      description: The workspace path to search in

output_schema:
  type: object
  properties:
    data:
      type: array
      items:
        type: string
      description: List of predicted file paths (absolute paths)

afs:
  modules:
    - module: local-fs
      options:
        name: workspace
        localPath: .
```

**Agent Instructions (predict-resources/instructions.md):**

~~~markdown
You are a resource prediction agent. Your job is to analyze a workspace
directory structure and predict which files would be most relevant for
a given task.

## Workspace Directory Structure

```yaml
{{ $afs.list("/modules/workspace", { maxChildren: 50, maxDepth: 10 }) | yaml.stringify }}
```

## Search Query

```txt
{{ query }}
```

## Selection Principles

### What to Include
- Entry points and main files
- Core modules related to the query
- Type definitions and schemas
- Configuration files
- Existing documentation

### What to Exclude
- Generated/compiled files
- Binary files
- Lock files
- Cache/temp files

## Output Format

Return a `data` array containing absolute file paths, ordered by relevance.
~~~

**Using the Preset:**

```yaml
afs:
  modules:
    - module: local-fs
      options:
        name: workspace
        localPath: .
  context:
    search:
      presets:
        predict-resources:
          select:
            agent: "./predict-resources/index.yaml"
```

**In Template:**

```jinja2
{{ $afs.search(workspace, "find files about authentication", { preset: "predict-resources" }) | yaml.stringify }}
```

#### Key Points for Select Agents

1. **Input Schema**: Must accept `path` and `query` properties
2. **Output Schema**: Must return `{ data: string[] }` with absolute file paths
3. **AFS Access**: The select agent can use `$afs` in its instructions to explore the file system
4. **Path Format**: Returned paths must be absolute paths starting with `/modules/`

## Key Features

1. **Async Data Handling**: Most `$afs` properties and all methods return Promises. Since Nunjucks does not natively support `await`, you **must** use a pipe filter (e.g., `| yaml.stringify`) to resolve the Promise and render the result.

   ```jinja2
   {# Correct - uses filter to resolve Promise #}
   {{ $afs.modules | yaml.stringify }}
   {{ $afs.list(path, options) | yaml.stringify }}

   {# Incorrect - will output [object Promise] #}
   {{ $afs.modules }}
   {{ $afs.list(path, options) }}
   ```

2. **YAML Filter**: The `yaml.stringify` filter both resolves the Promise and serializes the result to YAML format for readable output.

3. **Variable Passing**: Template variables (e.g., `workspace`, `doc_smith_workspace`) can be used in method calls.

4. **Error Handling**: If AFS is not configured, method calls will throw: `"AFS is not configured for this agent."`

## Other Built-in Context Variables

Besides `$afs`, the prompt builder also provides:

- **`$agent.skills`**: Returns the agent's skill list (name, description)
- **`userContext`**: User context data
- **Input Variables**: Access input parameters directly using `{{ variableName }}`

## Complete Example

~~~jinja2
{% if $afs.enabled %}
## Environment

{{ $afs.description }}

### Available Modules
```yaml
{{ $afs.modules | yaml.stringify }}
```

### Workspace Structure
```yaml
{{ $afs.list(workspace, { maxChildren: 50, maxDepth: 5, format: 'tree' }) | yaml.stringify }}
```

### Conversation History
```yaml
{{ $afs.histories | yaml.stringify }}
```

### Search Results
```yaml
{{ $afs.search(workspace, "configuration files", { limit: 10 }) | yaml.stringify }}
```
{% endif %}
~~~
