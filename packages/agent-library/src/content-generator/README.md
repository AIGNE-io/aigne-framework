# 用于结构规划与评估的 Agent

本项目使用 AIGNE 框架创建了一个多代理团队，负责为网站、文档和演示文稿等多种场景生成和评估结构化规划。

## 项目结构

-   `aigne.yaml`: 主项目配置文件，用于定义聊天模型并注册代理。
-   `structure.yaml`: 定义了一个按顺序工作的代理“团队”，负责协调整个规划和评估的工作流程。
-   `structure-planning.yaml`: 一个根据用户需求生成结构化规划的代理。该代理的具体指令位于 `./prompts/structure-planning.md`。
-   `evaluation.yaml`: 一个负责评估其他代理输出结果的代理。它会提供评分、理由和通过/失败的评估。其指令位于 `./prompts/evaluation.md`。
## 工作流程

该过程按顺序运行：
1.  `structure-planning` 代理接收用户请求并生成一个结构化规划。
3.  `evaluation` 代理根据预定义标准对规划进行评估，并输出分数和理由。

## 快速开始

### 安装 AIGNE CLI

```bash
npm install -g @aigne/cli
```

### 运行 Agent

运行 Agent 使用 input.yaml 文件作为入参。

```bash
# 配置 API Key ,根据使用的 model 不同配置不同的 Key
export GEMINI_API_KEY=xxx

# 运行生成 & 评估 Agent
aigne run --entry-agent "content-generator" --input "@mock-inputs/input.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --input-datasources "@mock-inputs/arcblock-datasources.md" --format yaml
```

`input.yaml` 中各输入的含义：

- question: 用户需求
- locale: 输出语言
- structureContext: 结构规划的上下文，用于辅助结构规划
- evaluationDimensions: 自定义评估标准

可以在 `aigne.yaml` 中修改使用的模型，或者在命令行中指定模型：

```bash
aigne run --entry-agent "content-generator" --input "@mock-inputs/input.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --input-datasources "@mock-inputs/arcblock-datasources.md" --format yaml --model openai:gpt-4o
```

其他的测试 input 运行命令

```bash
# arcshpere
aigne run --entry-agent "content-generator" --input "@mock-inputs/input-arcsphere.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --format yaml

# lban
aigne run --entry-agent "content-generator" --input "@mock-inputs/input-lban.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --format yaml

# lban locale run
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "content-generator" --input "@mock-inputs/input-lban.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --format yaml --output "./output-tmp/lban-all.txt" --force

# arcblock locale run 
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "content-generator" --input "@mock-inputs/input.yaml"  --input-datasources "@mock-inputs/arcblock-datasources.md" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --format yaml --output "./output-tmp/arcblock-all.txt" --force

# arcsphere local run
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "content-generator" --input "@mock-inputs/input-arcsphere.yaml" --input-datasources "@mock-inputs/arcsphere-datasources.md" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --input-componentList "@mock-inputs/component-list.md" --format yaml --output "./output-tmp/arcsphere-all.txt" --force --model openai:o3

# detail
aigne run --entry-agent "content-detail-generator" --input "@mock-inputs/detail-input.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --input-datasources "@mock-inputs/arcblock-datasources.md" --input-structurePlan "@mock-inputs/structure-plan-output.yaml" --format yaml --output "./output-tmp/home.txt" --force

# detail lban
aigne run --entry-agent "content-detail-generator" --input "@mock-inputs/detail-input-lban.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md"  --input-structurePlan "@mock-inputs/structure-plan-output-lban.yaml" --format yaml --output "./output-tmp/lban-home.txt" --force

npx aigne run --entry-agent "content-detail-generator" --input "@mock-inputs/detail-input-lban.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md"  --input-structurePlan "@mock-inputs/structure-plan-output-lban.yaml" --format yaml --output "./output-tmp/lban-home.txt" --force

# lban batch detail
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "batch-content-detail-generator" --input "@mock-inputs/detail-input-lban.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --format yaml --output "./output-tmp/lban-all.txt" --force

# arcblock batch detail
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "batch-content-detail-generator" --input "@mock-inputs/detail-input-lban.yaml" --format yaml --output "./output-tmp/lban-all.txt" --force

# arcshpere batch detail
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "batch-content-detail-generator" --input "@mock-inputs/detail-input-arcsphere.yaml" --format yaml --output "./output-tmp/arcsphere-detail-all.txt" --force

bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "batch-content-detail-generator" --input "@mock-inputs/detail-input.yaml"  --input-datasources "@mock-inputs/arcblock-datasources.md" --format yaml --output "./output-tmp/arcblock-all.txt" --force

# lban
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "content-generator" --input "@mock-inputs/input-lban.yaml" --input-evaluationDimensions "@prompts/structure-evaluation-dimensions.md" --format yaml
```

测试页面模板生成的命令
```bash
# arcshpere home
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "page-template-generator" --input "@mock-inputs/template-input-arcsphere-home.yaml" --format yaml --output "./output-tmp/arcsphere-home-template.txt" --force

```


测试文档生成的命令
```bash
# aigne
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "docs-generator" --input "@mock-inputs/aigne-docs-input.yaml" --format yaml 

# blocklet-sdk
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "docs-generator" --input "@mock-inputs/blocklet-sdk-docs-input.yaml" --format yaml 

# payment-kit
bun run /Users/lban/arcblock/code/aigne-framework/packages/cli/src/cli.ts run --entry-agent "docs-generator" --input "@mock-inputs/payment-kit-sdk-docs-input.yaml" --format yaml 

```

### 使用 observability 查看执行记录

运行指令打开一个 observability 服务

```bash 
aigne observability

// 会显示下面的输出
[dotenv-flow@4.1.0]: ".env*" files loading failed: no ".env*" files matching pattern ".env[.node_env][.local]" in "/Users/xxx/arcblock/code/pages-kit/packages/pages-kit-agents/aigne" dir undefined

     _    ___ ____ _   _ _____
    / \  |_ _/ ___| \ | | ____|
   / _ \  | | |  _|  \| |  _|
  / ___ \ | | |_| | |\  | |___
 /_/   \_\___\____|_| \_|_____|

            v1.13.1


DB PATH: file:/Users/xxx/.aigne/observability/observer.db
Running observability server on http://localhost:7811
```

访问 `http://localhost:7811` 查看运行记录，端可可能不同，访问实际日志中打印的链接 