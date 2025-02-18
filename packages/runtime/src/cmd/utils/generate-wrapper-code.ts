import {
  type DataType,
  OrderedRecord,
  type RunnableDefinition,
  isNonNullable,
} from "@aigne/core";

import type { ProjectDefinition } from "../../runtime/runtime";
import { formatCode } from "../../utils/prettier";

export async function generateWrapperCode(project: ProjectDefinition) {
  // TODO: 考虑中文和其他语言情况
  const projectName = (project.name || project.id)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/g, "_");

  const packageName = `@aigne-project/${projectName}`;

  const packageJson = JSON.stringify(
    {
      name: packageName,
      version: "0.0.1",
      main: "index.cjs",
      module: "index.js",
      types: "index.d.ts",
      dependencies: {
        "@aigne/core": "latest",
        "@aigne/runtime": "latest",
        "@aigne/ux": "latest",
      },
      exports: {
        ".": {
          require: "./index.cjs",
          import: "./index.js",
          types: "./index.d.ts",
        },
        "./middleware": {
          require: "./middleware.cjs",
          import: "./middleware.js",
          types: "./middleware.d.ts",
        },
        "./client": {
          require: "./client.cjs",
          import: "./client.js",
          types: "./client.d.ts",
        },
      },
    },
    null,
    2,
  );

  const index = `\
import { Runnable } from '@aigne/core';
import { AIGNERuntime, ProjectDefinition } from '@aigne/runtime';

const projectDefinition: ProjectDefinition = ${JSON.stringify(project, null, 2)};

${generateAgentsInterface(project.runnables, "Runnable")}

const ${projectName} = new AIGNERuntime<Agents>({
  projectDefinition,
});

export default ${projectName}
`;

  const middleware = `\
import { createMiddleware } from '@aigne/runtime/middleware';

import runtime from ${JSON.stringify(packageName)};

export default function ${projectName}() {
  return createMiddleware(runtime);
}
`;

  const client = `\
import type { ProjectDefinition } from '@aigne/runtime';
import { Agent, AIGNERuntime } from '@aigne/runtime/client';
import { AIGNERuntimeView } from '@aigne/ux';

const projectDefinition: ProjectDefinition = ${JSON.stringify(sanitizeProjectDefinition(project), null, 2)};

${generateAgentsInterface(project.runnables, "Agent")}

const ${projectName} = new AIGNERuntime<Agents>({
  projectDefinition,
});

export default ${projectName}
`;

  const tsFiles = [
    { fileName: "index.ts", content: index },
    { fileName: "middleware.ts", content: middleware },
    { fileName: "client.ts", content: client },
  ];

  const ts = await import("typescript");

  const result = (
    await Promise.all(
      tsFiles.map(async ({ fileName, content }) => {
        const cjs = ts.transpileModule(content, {
          fileName,
          compilerOptions: { module: ts.ModuleKind.CommonJS },
        });
        const esm = ts.transpileModule(content, {
          fileName,
          compilerOptions: { module: ts.ModuleKind.ESNext },
        });
        return [
          {
            fileName: fileName.replace(/\.ts$/, ".cjs"),
            content: await formatCode(cjs.outputText),
          },
          {
            fileName: fileName.replace(/\.ts$/, ".js"),
            content: await formatCode(esm.outputText),
          },
          {
            fileName: fileName.replace(/\.ts$/, ".d.ts"),
            content: await formatCode(content),
          },
        ];
      }),
    )
  ).flat();

  return [...result, { fileName: "package.json", content: packageJson }];
}

function sanitizeProjectDefinition(
  project: ProjectDefinition,
): ProjectDefinition {
  return {
    blockletDid: project.blockletDid,
    id: project.id,
    name: project.name,
    description: project.description,
    runnables: OrderedRecord.fromArray(
      OrderedRecord.map(project.runnables, (agent) => {
        return {
          type: agent.type,
          id: agent.id,
          name: agent.name,
          description: agent.description,
          inputs: agent.inputs,
          outputs: agent.outputs,
        };
      }),
    ),
  };
}

function generateAgentsInterface(
  runnables: OrderedRecord<RunnableDefinition>,
  agentInterface: string,
) {
  return `\
interface Agents {
  ${OrderedRecord.map(runnables, (agent) => {
    // ignore agent without name
    if (!agent.name) return null;

    // TODO: 把 Agent 的类型定义单独放到一个 ts 文件中，然后在这里引入
    return `${JSON.stringify(agent.name)}: ${agentInterface}<${fieldsToTsType(agent.inputs)}, ${fieldsToTsType(agent.outputs)}>`;
  })
    .filter(isNonNullable)
    .join(";\n")}
}
`;
}

function fieldsToTsType(fields: OrderedRecord<DataType>) {
  // TODO: 最好采用 json schema 的定义方式，使用第三方库生成类型定义
  return `\
{
  ${OrderedRecord.map(
    fields,
    (input) =>
      `${JSON.stringify(input.name || input.id)}: ${dataTypeToTsType(input)}${input.required ? "" : " | undefined"}`,
  ).join(";")}
}`;
}

function dataTypeToTsType(output: DataType) {
  if (output.type === "array") return "object[]";

  return output.type;
}
