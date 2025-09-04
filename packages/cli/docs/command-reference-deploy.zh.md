---
labels: ["Reference"]
---

`aigne deploy` 命令用于将 AIGNE 应用程序打包并作为 Blocklet 部署到指定端点。此过程会自动完成在生产环境中运行 Agent 所需的配置、捆绑和部署步骤。

## 用法

```bash
aigne deploy --path <path-to-project> --endpoint <blocklet-server-endpoint>
```

## 选项

| 选项 | 描述 | 是否必需 |
|---|---|---|
| `--path` | 要部署的 AIGNE 项目目录的文件路径。 | 是 |
| `--endpoint` | 应用程序将部署到的 Blocklet Server 端点的 URL。 | 是 |

## 部署流程

运行 `aigne deploy` 命令时，CLI 会执行一系列自动化任务来准备和上传你的应用程序。该流程在首次运行时为交互式，在后续部署中则完全自动化。

```d2
direction: down

start: {
  label: "aigne deploy\n--path <...>\n--endpoint <...>"
  shape: step
}

prepare: {
  label: "1. 准备环境"
  shape: rectangle
  
  sub-tasks: {
    grid-columns: 1
    "创建 .deploy 目录": {}
    "复制项目和模板文件": {}
    "运行 npm install": {}
  }
}

check_cli: {
  label: "2. 检查 @blocklet/cli"
  shape: diamond
}

prompt_install: {
  label: "提示用户安装"
  shape: parallelogram
}

install_cli: {
  label: "安装 @blocklet/cli"
  shape: rectangle
}

configure: {
  label: "3. 配置 Blocklet"
  shape: rectangle
  
  sub-tasks: {
    grid-columns: 1
    "读取 ~/.aigne/deployed.yaml": {}
    "提示输入名称（如果是新的）": {}
    "创建 DID（如果是新的）": {}
    "更新 blocklet.yml": {}
    "将信息保存到 deployed.yaml": {}
  }
}

bundle: {
  label: "4. 捆绑应用程序\n(blocklet bundle)"
  shape: rectangle
}

deploy: {
  label: "5. 部署到端点\n(blocklet deploy)"
  shape: rectangle
}

cleanup: {
  label: "6. 清理\n(删除 .deploy 目录)"
  shape: rectangle
}

end: {
  label: "部署完成"
  shape: oval
  style.fill: "#d4edda"
}

start -> prepare
prepare -> check_cli
check_cli -> "是": configure
check_cli -> "否": prompt_install
prompt_install -> install_cli
install_cli -> configure
configure -> bundle
bundle -> deploy
deploy -> cleanup
cleanup -> end
```

以下是所涉及步骤的详细说明：

1.  **准备环境**：在你的项目根目录下会创建一个临时的 `.deploy` 目录。你的 Agent 文件和标准的 Blocklet 模板会被复制到该目录中。如果你的项目中存在 `package.json` 文件，则会自动在该临时目录中运行 `npm install`。

2.  **检查 Blocklet CLI**：该命令会验证 `@blocklet/cli` 是否已全局安装。如果未安装，它会提示你授权安装，因为捆绑和部署过程需要该工具。

3.  **配置 Blocklet**：`.deploy` 目录中的 `blocklet.yml` 配置文件会被自动填充。
    *   **名称**：首次部署项目时，系统会提示你为 Blocklet 输入名称。默认建议值取自 `aigne.yaml` 文件中的 `name` 字段。选定的名称将被保存，以供未来部署使用。
    *   **DID**：系统会使用 Blocklet CLI 为你的 Blocklet 创建一个唯一的去中心化身份标识（DID）。此 DID 也会被保存并用于后续的部署。
    *   每个项目的部署信息（名称和 DID）都存储在 `~/.aigne/deployed.yaml` 文件中，并与项目的绝对路径相对应，以便简化未来的更新流程。

4.  **捆绑应用程序**：系统会执行 `blocklet bundle --create-release` 命令，将所有必要文件打包到一个位于 `.blocklet/bundle` 目录下的可部署构件中。

5.  **部署到端点**：最后，系统会运行 `blocklet deploy` 命令，将捆绑好的构件推送到指定的 `--endpoint`。底层命令的输出会直接流式传输到你的终端，以便你监控进度。

6.  **清理**：部署成功后，临时的 `.deploy` 目录将被删除。

## 示例

将位于 `my-chat-agent` 目录下的 AIGNE 项目部署到 `https://my-node.blocklet.dev` 的 Blocklet Server 上：

```bash
aigne deploy --path ./my-chat-agent --endpoint https://my-node.blocklet.dev
```

在首次运行时，系统可能会要求你输入信息：

```bash
? Please input agent blocklet name: (my-chat-agent) my-production-chat-agent
```

输入名称并完成流程后，后续运行同一命令时将自动重用 `my-production-chat-agent`。

---

有关部署 Agent 的更详细演练，请参阅 [部署 Agents](./guides-deploying-agents.md) 指南。