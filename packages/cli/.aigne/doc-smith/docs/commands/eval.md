# Eval Command

Evaluates the performance of an AIGNE agent against a dataset using specified metrics or another agent as an evaluator.

## Usage

```bash
aigne eval [path] [agent] [options]
```

## Arguments

- `[path]`: Path to the project (default: `.`).
- `[agent]`: Name of the agent to evaluate.

## Options

| Option | Alias | Description |
| :--- | :--- | :--- |
| `--dataset` | | Path to the dataset file (required). |
| `--evaluator` | | Name of the evaluator agent/skill to use. |
| `--concurrency` | | Number of concurrent evaluations (default: 1). |
| `--output` | `-o` | Path to save the evaluation report (e.g., CSV). |

## Description

The `eval` command runs an evaluation pipeline:
1.  Loads the dataset.
2.  Runs the target agent against the dataset.
3.  Uses an evaluator (LLM-based) to score the results.
4.  Reports the results to the console and optionally to a file.

## Examples

Evaluate "my-agent" using "judge-agent" and a dataset:
```bash
aigne eval --agent my-agent --dataset ./test-data.json --evaluator judge-agent
```

Evaluate with high concurrency and save report:
```bash
aigne eval --agent my-agent --dataset ./data.json --evaluator judge --concurrency 5 -o report.csv
```

---
**Related:** [Test Command](/commands/test.md)
