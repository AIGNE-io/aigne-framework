# Prompt Builder Adoption Audit

## Summary
- Reviewed the repository for prompt definitions that bypass `PromptBuilder` and rely on ad-hoc strings, templates, or manual message assembly.
- Cataloged every example, documentation snippet, and production module that does not leverage `PromptBuilder` as intended.
- Suggested guardrails and enhancements for the existing `PromptBuilder` implementation to enforce best practices and unlock automatic prompt optimization.

## Locations Using Manual Prompts
The following sections enumerate all files where prompts are authored as raw strings, template literals, or custom templates instead of using `PromptBuilder`-managed definitions.

### Runtime Examples (`examples/`)
- `examples/workflow-group-chat/index.ts` defines multiple agents with literal `instructions` strings and constructs the manager prompt with `PromptTemplate.from(...)` formatting rather than a builder-managed template.【F:examples/workflow-group-chat/index.ts†L32-L87】【F:examples/workflow-group-chat/index.ts†L120-L144】
- `examples/memory-did-spaces/index.ts` embeds a multi-line literal for the DID Spaces assistant persona.【F:examples/memory-did-spaces/index.ts†L13-L26】
- `examples/nano-banana/index.ts` and `examples/nano-banana/usage.ts` provide identical raw strings for the drawing agent.【F:examples/nano-banana/index.ts†L8-L19】【F:examples/nano-banana/usage.ts†L11-L18】
- `examples/workflow-reflection/index.ts` and `examples/workflow-reflection/usages.ts` hardcode coder/reviewer instructions with templated handlebars inside backticks.【F:examples/workflow-reflection/index.ts†L7-L66】【F:examples/workflow-reflection/usages.ts†L13-L69】
- `examples/workflow-orchestrator/index.ts` and `examples/workflow-orchestrator/usage.ts` hand-roll role prompts, including long rule blocks, via template literals.【F:examples/workflow-orchestrator/index.ts†L18-L62】【F:examples/workflow-orchestrator/usage.ts†L27-L68】
- `examples/mcp-sqlite/usages.ts` assigns a plain string persona for the database administrator example.【F:examples/mcp-sqlite/usages.ts†L23-L39】
- `examples/mcp-blocklet/index.ts` calls `PromptBuilder.from` with a raw string instead of a builder template definition.【F:examples/mcp-blocklet/index.ts†L122-L138】
- `examples/afs-system-fs/index.ts` uses a direct string to describe the AFS-enabled chatbot.【F:examples/afs-system-fs/index.ts†L28-L47】
- `examples/memory/index.ts` configures the memory demo with literal instructions.【F:examples/memory/index.ts†L8-L24】
- `examples/mcp-did-spaces/index.ts` contains hardcoded DID Spaces directions including formatting rules.【F:examples/mcp-did-spaces/index.ts†L12-L41】
- `examples/workflow-concurrency/index.ts` and `examples/workflow-concurrency/usages.ts` embed analyst/researcher prompts as raw template literals.【F:examples/workflow-concurrency/index.ts†L6-L36】【F:examples/workflow-concurrency/usages.ts†L12-L48】
- `examples/workflow-code-execution/index.ts` and `examples/workflow-code-execution/usages.ts` use handwritten coder prompts rather than declarative builder specs.【F:examples/workflow-code-execution/index.ts†L9-L50】【F:examples/workflow-code-execution/usages.ts†L13-L44】
- `examples/workflow-router/index.ts` and `examples/workflow-router/usages.ts` configure four agents with direct strings and router instructions without `PromptBuilder` composition.【F:examples/workflow-router/index.ts†L7-L62】【F:examples/workflow-router/usages.ts†L12-L70】
- `examples/workflow-sequential/index.ts` and `examples/workflow-sequential/usages.ts` rely on multiline template literals with inline handlebars placeholders.【F:examples/workflow-sequential/index.ts†L6-L60】【F:examples/workflow-sequential/usages.ts†L12-L72】
- `examples/mcp-github/index.ts` and `examples/mcp-github/usages.ts` ship a Markdown-style persona as a raw template.【F:examples/mcp-github/index.ts†L12-L52】【F:examples/mcp-github/usages.ts†L13-L65】
- `examples/mcp-puppeteer/index.ts` and `examples/mcp-puppeteer/usages.ts` craft a step-by-step prompt via string literals.【F:examples/mcp-puppeteer/index.ts†L7-L36】【F:examples/mcp-puppeteer/usages.ts†L13-L43】
- `examples/workflow-handoff/index.ts` and `examples/workflow-handoff/usages.ts` codify multiple role prompts and transfer personas directly in code.【F:examples/workflow-handoff/index.ts†L85-L155】【F:examples/workflow-handoff/usages.ts†L16-L46】
- `examples/chat-bot/agents/chat.yaml` and `examples/mcp-server/agents/poet.yaml` store human-written instructions in YAML without a builder template schema.【F:examples/chat-bot/agents/chat.yaml†L1-L8】【F:examples/mcp-server/agents/poet.yaml†L1-L17】

### Documentation & Reference Tests (`docs-examples/`)
- `docs-examples/test/quick-start.test.ts` demonstrates literal `instructions` strings in quick-start snippets.【F:docs-examples/test/quick-start.test.ts†L20-L36】
- `docs-examples/test/build-first-agent.test.ts` repeats string-based personas across multiple how-to sections.【F:docs-examples/test/build-first-agent.test.ts†L29-L52】
- `docs-examples/test/concepts/agent.test.ts` (and adjacent concept tests) continue the pattern with financial assistant prompts and others.【F:docs-examples/test/concepts/agent.test.ts†L120-L330】

### Library & Utility Modules
- `packages/agent-library/src/orchestrator/orchestrator-prompts.ts` exposes orchestration prompt templates as raw Nunjucks strings instead of shipping them as reusable `PromptBuilder` assets.【F:packages/agent-library/src/orchestrator/orchestrator-prompts.ts†L96-L180】
- `packages/agent-library/src/data-mapper/prompts.ts` maintains an extensive JSONata guidance prompt as a string constant, and `agents/mapper.ts` injects it by hand into `PromptBuilder.from({ messages: [...] })` rather than referencing a central builder template definition.【F:packages/agent-library/src/data-mapper/prompts.ts†L1-L83】【F:packages/agent-library/src/data-mapper/agents/mapper.ts†L1-L48】
- `packages/cli/src/utils/evaluation/evaluator.ts` defines the evaluation rubric as a constant and feeds it directly to `AIAgent.from` without any builder-level metadata.【F:packages/cli/src/utils/evaluation/evaluator.ts†L5-L80】

### Memory & AFS Integrations
- `memory/agentic/src/prompt.ts` and `memory/agentic/src/memory.ts` default to literal recorder instructions when spinning up the extractor agent.【F:memory/agentic/src/prompt.ts†L1-L33】【F:memory/agentic/src/memory.ts†L60-L96】
- `afs/user-profile-memory/src/prompt.ts` encodes the entire user-profile extraction logic as a raw template block rather than registering a builder-friendly specification.【F:afs/user-profile-memory/src/prompt.ts†L1-L38】

### Core & Workspace Tests
- `packages/core/test/agents/model-simple-usage.test.ts` (and similar agent tests) instantiate agents with string instructions to illustrate API usage.【F:packages/core/test/agents/model-simple-usage.test.ts†L5-L36】
- Broader regression tests across `packages/core/test`, `packages/test-utils`, and top-level integration suites rely on literal `SystemMessageTemplate` or string instructions, reinforcing non-builder patterns; representative cases appear in `packages/core/test/agents/ai-agent.test.ts` and `tests/nodejs/core.test.ts`.【F:packages/core/test/agents/ai-agent.test.ts†L70-L115】【F:tests/nodejs/core.test.ts†L6-L12】

## Recommendations for Prompt Builder
The current `PromptBuilder` implementation (`packages/core/src/prompt/prompt-builder.ts`) already centralizes prompt formatting, but a few adjustments would strengthen adoption and unlock automated optimization workflows.【F:packages/core/src/prompt/prompt-builder.ts†L56-L140】

1. **Deprecate raw string inputs**: `PromptBuilder.from` eagerly wraps plain strings into `SystemMessageTemplate` instances, making it easy for callers to bypass the builder model. Consider warning or rejecting bare strings in favor of declarative template descriptors (e.g., JSON/YAML prompt manifests or builder DSL objects) so examples and modules must register prompts through the builder pipeline.【F:packages/core/src/prompt/prompt-builder.ts†L56-L90】
2. **Package canonical templates**: Ship reusable builder definitions (per agent persona, evaluation rubric, orchestration plan, etc.) that can be imported rather than copied as literals. This would let examples replace in-line strings with references like `PromptBuilder.registry.orchestratorPlan()` and ensure updates propagate consistently across the repo.
3. **Inject model-aware best practices**: Extend `PromptBuilder` to accept metadata about the target LLM (model family, modality, safety constraints) and automatically compose system messages, memory sections, and formatting hints. Today the builder forwards the provided instructions with minimal augmentation; embedding heuristics here would align with the stated goal of automatic prompt optimization.【F:packages/core/src/prompt/prompt-builder.ts†L180-L259】
4. **Codify module metadata contracts**: For integrations like AFS or memory, define typed prompt modules that express required metadata (search snippets, schema references) so that mounting a virtual filesystem automatically contributes builder-ready prompt segments instead of ad-hoc strings.【F:afs/user-profile-memory/src/prompt.ts†L1-L38】【F:memory/agentic/src/prompt.ts†L1-L33】
5. **Provide migration helpers**: Add lint rules or codemods that detect `instructions: "..."` patterns and suggest equivalent builder usage. Pair this with documentation updates that walk developers through the builder DSL, ensuring future examples and tutorials stay compliant.

Addressing these gaps will align sample code, docs, and internal modules with the intended Prompt Builder workflow while paving the way for automatic prompt optimization features.
