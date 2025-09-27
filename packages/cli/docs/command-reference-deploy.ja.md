---
labels: ["Reference"]
---

---
labels: ["リファレンス"]
---

# aigne deploy

`aigne deploy` コマンドは、AIGNE アプリケーションをパッケージ化し、指定された Blocklet Server エンドポイントに [Blocklet](https://www.blocklet.dev/) としてデプロイします。これは、Agent を本番環境で使用するために公開する標準的な方法であり、自己完結型の実行可能なサービスとしてアクセスできるようにします。

## 使用法

```bash Basic Usage icon=mdi:console
aigne deploy --path <path-to-project> --endpoint <deploy-endpoint>
```

## オプション

<x-field data-name="--path" data-type="string" data-required="true" data-desc="aigne.yaml ファイルを含む AIGNE プロジェクトディレクトリへのパスを指定します。"></x-field>

<x-field data-name="--endpoint" data-type="string" data-required="true" data-desc="アプリケーションがデプロイされる Blocklet Server エンドポイントの URL。"></x-field>

## デプロイプロセス

`deploy` コマンドは、Agent を正しくパッケージ化し、ターゲット環境にデプロイするためのいくつかのステップを自動化します。このプロセスは、特定のプロジェクトの初回実行時はインタラクティブであり、その後の更新では非インタラクティブです。

```d2 デプロイワークフロー
direction: down

開発者: { 
  shape: c4-person 
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
  label: "デプロイされた Agent\n(Blocklet として)"
}

開発者 -> CLI: "パスとエンドポイントを指定してコマンドを実行"
CLI.task-5 -> Blocklet-Server: "バンドルのアップロード"
Blocklet-Server -> Deployed-Blocklet: "Agent のホスト"
```

コマンドを実行したときに何が起こるかのステップバイステップの内訳は次のとおりです。

1.  **環境の準備**: プロジェクトのルートに一時的な `.deploy` ディレクトリが作成されます。コマンドは、Agent のソースファイルと標準の Blocklet テンプレートをこのディレクトリにコピーして、パッケージ化の準備をします。

2.  **依存関係のインストール**: `package.json` ファイルが存在する場合、一時ディレクトリ内で `npm install` を実行して、必要なすべての依存関係を取得します。

3.  **Blocklet CLI の確認**: コマンドは `@blocklet/cli` がグローバルにインストールされていることを確認します。見つからない場合は、Blocklet のパッケージ化とデプロイに必要であるため、自動的にインストールするように促されます。

4.  **設定（初回デプロイ）**: プロジェクトの初回デプロイ時に、CLI は簡単なインタラクティブな設定を案内します：
    *   **Blocklet 名**: Blocklet の名前を入力するよう求められます。`aigne.yaml` の `name` フィールドまたはプロジェクトのディレクトリ名に基づいてデフォルトが提案されます。
    *   **DID の生成**: `blocklet create --did-only` を使用して、Blocklet 用に新しい分散型識別子（DID）が自動的に生成され、一意で検証可能なアイデンティティが与えられます。
    *   この設定（名前と DID）はローカルの `~/.aigne/deployed.yaml` に保存されます。同じプロジェクトのその後のデプロイでは、これらの保存された値が自動的に使用され、プロセスが非インタラクティブになります。

5.  **バンドル**: CLI は `blocklet bundle --create-release` を実行して、すべてのアプリケーションファイルを単一のデプロイ可能なアーティファクトにパッケージ化します。

6.  **デプロイ**: 最終的なバンドルは、`blocklet deploy` を使用して指定した `--endpoint` にアップロードされます。

7.  **クリーンアップ**: デプロイが成功すると、一時的な `.deploy` ディレクトリは自動的に削除されます。

## 例

現在のディレクトリにある AIGNE プロジェクトを Blocklet Server にデプロイするには：

```bash プロジェクトのデプロイ icon=mdi:console
aigne deploy --path . --endpoint https://my-node.abtnode.com
```

このプロジェクトを初めてデプロイする場合、Agent Blocklet に名前を付けるプロンプトが表示されます。

```text 初回デプロイ時のプロンプト
✔ デプロイ環境の準備
✔ Blocklet CLI の確認
ℹ Blocklet の設定
? agent blocklet 名を入力してください: › my-awesome-agent
✔ Blocklet のバンドル
...
✅ デプロイ完了: /path/to/your/project -> https://my-node.abtnode.com
```

デプロイターゲットの設定やデプロイされた Agent の管理に関するより詳細なウォークスルーについては、[Deploying Agents](./guides-deploying-agents.md) ガイドを参照してください。