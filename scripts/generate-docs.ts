import { join } from "node:path";
import { $ } from "zx";

const root = join(import.meta.dir, "..");

const entries = [
  {
    sources: "/packages/core/src/aigne/aigne.ts",
    examples: "/docs-examples/test/concepts/aigne.test.ts",
    output: "/docs/concepts/aigne.zh.md",
  },
  // {
  //   sources: "/packages/core/src/agents/agent.ts",
  //   examples: "/docs-examples/test/concepts/agent.test.ts",
  //   output: "/docs/concepts/agent.zh.md",
  // },
  // {
  //   sources: "/packages/core/src/agents/agent.ts",
  //   examples: "/docs-examples/test/concepts/function-agent.test.ts",
  //   output: "/docs/concepts/function-agent.zh.md",
  // },
  // {
  //   sources: "/packages/core/src/agents/ai-agent.ts",
  //   examples: "/docs-examples/test/concepts/ai-agent.test.ts",
  //   output: "/docs/concepts/ai-agent.zh.md",
  // },
  // {
  //   sources: "/packages/core/src/agents/chat-model.ts",
  //   examples: "/docs-examples/test/concepts/chat-model.test.ts",
  //   output: "/docs/concepts/chat-model.zh.md",
  // },
  // {
  //   sources: "/packages/core/src/agents/guide-rail-agent.ts",
  //   examples: "/docs-examples/test/concepts/guide-rail-agent.test.ts",
  //   output: "/docs/concepts/guide-rail-agent.zh.md",
  // },
  // {
  //   sources: "/packages/core/src/agents/mcp-agent.ts",
  //   examples: "/docs-examples/test/concepts/mcp-agent.test.ts",
  //   output: "/docs/concepts/mcp-agent.zh.md",
  // },
  // {
  //   sources: "/packages/core/src/agents/team-agent.ts",
  //   examples: "/docs-examples/test/concepts/team-agent.test.ts",
  //   output: "/docs/concepts/team-agent.zh.md",
  // },
];

await Promise.all(
  entries.map(async ({ sources, examples, output }) => {
    await $({
      stdio: "inherit",
    })`aigne-wiki --input-language zh_CN --input-sources ${join(root, sources)} --input-examples ${join(root, examples)} --output-key markdown --output ${join(root, output)} --force`;
  }),
);
