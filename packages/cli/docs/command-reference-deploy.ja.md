---
labels: ["Reference"]
---

# aigne deploy

`aigne deploy` コマンドは、AIGNE アプリケーションを [Blocklet](https://www.blocklet.dev/) としてパッケージ化し、指定された Blocklet Server エンドポイントにデプロイします。これは、agent を本番環境で使用するために公開するための標準的な方法であり、自己完結型の実行可能なサービスとしてアクセス可能にします。

## 使用方法

```bash 基本的な使用法 icon=mdi:console
aigne deploy --path <path-to-project> --endpoint <deploy-endpoint>
```

## オプション

<x-field data-name="--path" data-type="string" data-required="true" data-desc="aigne.yaml ファイルを含む AIGNE プロジェクトディレクトリへのパスを指定します。"></x-field>

<x-field data-name="--endpoint" data-type="string" data-required="true" data-desc="アプリケーションがデプロイされる Blocklet Server エンドポイントの URL です。"></x-field>

## デプロイプロセス

`deploy` コマンドは、agent を正しくパッケージ化し、ターゲット環境にデプロイするためのいくつかのステップを自動化します。このプロセスは、特定のプロジェクトの初回実行時にはインタラクティブであり、その後の更新では非インタラクティブになります。

```d2 デプロイワークフロー
direction: down

Developer: { 
  shape: c4-person 
  label: "開発者"
}

CLI: {
  label: "`aigne deploy`"
  
  task-1: { label: "1. 環境の準備" }
  task-2: { label: "2. Blocklet CLI の確認" }
  task-3: { label: "3. Blocklet の設定\n(名前と DID)" }
  task-4: { label: "4. プロジェクトのバンドル" }
  task-5: { label: "5. サーバーへのデプロイ" }

  task-1 -> task-2 -> task-3 -> task-4 -> task-5
}

Blocklet-Server: {
  label: "Blocklet Server"
  icon: "https://www.arcblock.io/image-bin/uploads/eb1cf5d60cd85c42362920c49e3768cb.svg"
}

Deployed-Blocklet: {
  label: "デプロイされた Agent\n(Blockletとして)"
}

Developer -> CLI: "パスとエンドポイントを指定してコマンドを実行"
CLI.task-5 -> Blocklet-Server: "バンドルをアップロード"
Blocklet-Server -> Deployed-Blocklet: "agent をホスト"
```

コマンドを実行したときに何が起こるかを、ステップバイステップで説明します：

1.  **環境の準備**：プロジェクトのルートに一時的な `.deploy` ディレクトリが作成されます。コマンドは、パッケージングの準備のために、agent のソースファイルと標準の Blocklet テンプレートをこのディレクトリにコピーします。

2.  **依存関係のインストール**：`package.json` ファイルが存在する場合、一時ディレクトリ内で `npm install` を実行し、必要なすべての依存関係を取得します。

3.  **Blocklet CLI の確認**：コマンドは `@blocklet/cli` がグローバルにインストールされていることを確認します。見つからない場合、Blocklet のパッケージ化とデプロイに必要であるため、自動的にインストールするように促されます。

4.  **設定（初回デプロイ時）**：プロジェクトの初回デプロイ時に、CLI は短いインタラクティブなセットアップを案内します：
    *   **Blocklet 名**：Blocklet の名前を入力するよう求められます。`aigne.yaml` の `name` フィールドまたはプロジェクトのディレクトリ名に基づいたデフォルト名が提案されます。
    *   **DID の生成**：`blocklet create --did-only` を使用して、Blocklet の新しい分散型識別子（DID）が自動的に生成され、一意で検証可能なアイデンティティが与えられます。
    *   この設定（名前と DID）は、ローカルの `~/.aigne/deployed.yaml` に保存されます。同じプロジェクトのその後のデプロイでは、これらの保存された値が自動的に使用されるため、プロセスは非インタラクティブになります。

5.  **バンドル化**：CLI は `blocklet bundle --create-release` を実行し、すべてのアプリケーションファイルを単一のデプロイ可能なアーティファクトにパッケージ化します。

6.  **デプロイ**：最終的なバンドルは `blocklet deploy` を使用して、指定した `--endpoint` にアップロードされます。

7.  **クリーンアップ**：デプロイが成功すると、一時的な `.deploy` ディレクトリは自動的に削除されます。

## 例

現在のディレクトリにある AIGNE プロジェクトを Blocklet Server にデプロイするには：

```bash プロジェクトのデプロイ icon=mdi:console
aigne deploy --path . --endpoint https://my-node.abtnode.com
```

このプロジェクトを初めてデプロイする場合、agent Blocklet に名前を付けるよう促すプロンプトが表示されます：

```text 初回デプロイ時のプロンプト
✔ Prepare deploy environment
✔ Check Blocklet CLI
ℹ Configure Blocklet
? Please input agent blocklet name: › my-awesome-agent
✔ Bundle Blocklet
...
✅ Deploy completed: /path/to/your/project -> https://my-node.abtnode.com
```

デプロイターゲットの設定とデプロイされた agent の管理に関するより詳細なウォークスルーについては、[Agent のデプロイ](./guides-deploying-agents.md) ガイドを参照してください。