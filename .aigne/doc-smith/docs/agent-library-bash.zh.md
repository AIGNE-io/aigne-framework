# Bash

`BashAgent` 允许在 AIGNE 工作流中执行 shell 命令和脚本。本指南详细介绍了其配置和用法，允许直接与底层操作系统交互，以执行文件操作、进程管理和自动化命令行工具等任务。

## 概述

`BashAgent` 充当 AIGNE 框架与标准 Bash shell 之间的桥梁。它旨在运行 shell 脚本，捕获其标准输出（`stdout`）、标准错误（`stderr`）和退出代码，并将这些信息作为结构化输出返回。

为确保安全，该 Agent 默认在隔离的沙盒环境中执行命令。这可以防止脚本访问未经授权的网络资源或意外修改文件系统。沙盒行为是可配置的，既支持安全的隔离执行，也支持在必要时进行无限制的执行。

下图展示了 `BashAgent` 的工作流程，从接收脚本到返回输出，包括可选的沙盒层。

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![Bash](assets/diagram/agent-library-bash-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 输入

该 Agent 接受一个 `script` 属性，其中包含要执行的 Bash 命令。

<x-field-group>
  <x-field data-name="script" data-type="string" data-required="true" data-desc="要执行的 bash 脚本或命令。"></x-field>
</x-field-group>

## 输出

完成后，该 Agent 会返回一个对象，其中包含输出流和脚本的最终退出代码。

<x-field-group>
  <x-field data-name="stdout" data-type="string" data-required="false" data-desc="脚本产生的标准输出。"></x-field>
  <x-field data-name="stderr" data-type="string" data-required="false" data-desc="脚本产生的标准错误输出。"></x-field>
  <x-field data-name="exitCode" data-type="number" data-required="false" data-desc="脚本完成后返回的退出代码。"></x-field>
</x-field-group>

## 配置

`BashAgent` 实例化时可以带一个可选的 `options` 对象，用于控制其执行环境。

```typescript agent.ts
import { BashAgent } from "@aigne/agent-library/bash";

// 默认行为：在安全的沙盒中运行
const secureAgent = new BashAgent({});

// 禁用沙盒以进行无限制执行
const insecureAgent = new BashAgent({
  sandbox: false,
});

// 配置沙盒以允许特定的网络访问
const configuredAgent = new BashAgent({
  sandbox: {
    network: {
      allowedDomains: ["api.example.com"],
    },
  },
});
```

### 选项

<x-field-group>
  <x-field data-name="sandbox" data-type="boolean | object" data-required="false">
    <x-field-desc markdown>控制沙盒执行环境。如果为 `false`，则禁用沙盒。如果为 `object`，则配置沙盒规则。默认情况下，沙盒已启用并采用限制性设置。</x-field-desc>
    <x-field data-name="network" data-type="object" data-required="false" data-desc="配置网络访问规则。">
      <x-field data-name="allowedDomains" data-type="string[]" data-required="false" data-desc="允许脚本访问的域名列表。"></x-field>
      <x-field data-name="deniedDomains" data-type="string[]" data-required="false" data-desc="明确禁止脚本访问的域名列表。"></x-field>
    </x-field>
    <x-field data-name="filesystem" data-type="object" data-required="false" data-desc="配置文件系统访问规则。">
      <x-field data-name="allowWrite" data-type="string[]" data-required="false" data-desc="允许脚本写入的文件路径或目录列表。"></x-field>
      <x-field data-name="denyRead" data-type="string[]" data-required="false" data-desc="禁止脚本读取的文件路径或目录列表。"></x-field>
      <x-field data-name="denyWrite" data-type="string[]" data-required="false" data-desc="禁止脚本写入的文件路径或目录列表。"></x-field>
    </x-field>
  </x-field>
</x-field-group>

:::warning
通过设置 `sandbox: false` 禁用沙盒，将允许脚本以与父 Node.js 进程相同的权限执行。这只应在受信任的环境中进行，因为它可能引入安全风险。
:::

## 示例

### 基本脚本执行

此示例演示了如何执行一个简单的脚本，该脚本会向 `stdout` 和 `stderr` 输出内容，然后退出。

```typescript example.ts
import { BashAgent } from "@aigne/agent-library/bash";

const bashAgent = new BashAgent({});

const script = `
  echo "Hello, World!"
  echo "This is an error message" >&2
  exit 0
`;

const result = await bashAgent.invoke({ script });
console.log(result);
```

执行将产生以下输出，捕获了输出流和成功的退出代码。

```json
{
  "stdout": "Hello, World!\n",
  "stderr": "This is an error message\n",
  "exitCode": 0
}
```

### 禁用沙盒

此示例展示了如何禁用沙盒以执行需要无限制网络访问的命令，例如 `curl`。

```typescript example-no-sandbox.ts
import { BashAgent } from "@aigne/agent-library/bash";

const bashAgent = new BashAgent({
  sandbox: false,
});

const script = `curl https://bing.com`;
const result = await bashAgent.invoke({ script });

console.log(result.stdout);
console.log(result.exitCode);
```

输出将包含网页的 HTML 内容和退出代码 `0`。

```html
<html><head><title>Object moved</title></head><body>
<h2>Object moved to <a href="https://www.bing.com:443/?toWww=1&amp;redig=D26DC3A15DA244F9AB9D1A420426F9E5">here</a>.</h2>
</body></html>
```

```
0
```

### 在沙盒中配置网络访问

此示例演示了如何授予沙盒脚本访问特定域名的权限。尝试访问未经授权的域名将会失败。

```typescript example-sandbox-network.ts
import { BashAgent } from "@aigne/agent-library/bash";

const bashAgent = new BashAgent({
  sandbox: {
    network: {
      allowedDomains: ["bing.com"],
    },
  },
});

// 此命令将成功，因为 bing.com 是允许的域名。
const resultAuthorized = await bashAgent.invoke({ script: "curl https://bing.com" });
console.log("Authorized request exit code:", resultAuthorized.exitCode); // 0

// 此命令将失败，因为 google.com 不在允许列表中。
const resultUnauthorized = await bashAgent.invoke({ script: "curl https://google.com" });
console.log("Unauthorized request exit code:", resultUnauthorized.exitCode); // 56
console.error(resultUnauthorized.stderr); // curl: (56) CONNECT tunnel failed, response 403
```

第一个命令成功，返回退出代码 `0`。第二个命令失败，因为沙盒阻止了网络请求，导致非零退出代码和来自 `curl` 的错误消息。