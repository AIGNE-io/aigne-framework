---
labels: ["Reference"]
---

# Agent のデプロイ

AIGNE プロジェクトをデプロイすると、ローカルの開発セットアップから Blocklet として知られる自己完結型の配布可能なアプリケーションに変換されます。これにより、Agent は本番環境で実行され、他者と共有され、より広範な Blocklet エコシステムにシームレスに統合できます。`aigne deploy` コマンドは、このパッケージングとデプロイのプロセス全体を自動化します。

このガイドでは、デプロイのワークフローを説明します。利用可能なすべてのコマンドオプションの詳細については、[`aigne deploy` コマンドリファレンス](./command-reference-deploy.md) を参照してください。

## デプロイプロセス

`aigne deploy` コマンドは、Agent の準備、設定、バンドル、デプロイの一連のステップを調整します。内部では `@blocklet/cli` を活用して、Blocklet 作成の複雑さを処理します。

以下に、デプロイフローの概要を示します。

<!-- DIAGRAM_IMAGE_START:guide:4:3 -->
![---](assets/diagram/deploying-agents-diagram-0.jpg)
<!-- DIAGRAM_IMAGE_END -->

### ステップバイステップのウォークスルー

プロジェクトをデプロイするには、プロジェクトのルートディレクトリに移動し、プロジェクトへのパスとターゲットエンドポイントを指定してデプロイコマンドを実行します。

```bash コマンド icon=lucide:terminal
aigne deploy --path . --endpoint <your-endpoint-url>
```

このコマンドを実行すると何が起こるか、詳しく見ていきましょう。

1.  **環境準備**: CLI はまず一時的な `.deploy` ディレクトリを作成します。プロジェクトファイルを標準の Blocklet テンプレートとともにそこにコピーします。その後、このディレクトリ内で `npm install` を実行し、必要な依存関係を取得します。

2.  **Blocklet CLI の確認**: このプロセスは、`@blocklet/cli` がシステムにインストールされているかを確認します。インストールされていない場合は、グローバルにインストールする許可を求められます。これは一度だけのセットアップです。

    ```
    ? Install Blocklet CLI? ›
    ❯ yes
      no
    ```

3.  **Blocklet の設定 (初回デプロイ時)**: このプロジェクトを初めてデプロイする場合、CLI は Blocklet の名前を尋ねます。`aigne.yaml` 内の Agent 名またはプロジェクトのフォルダ名に基づいてデフォルト名を提案します。

    ```
    ? Please input agent blocklet name: › my-awesome-agent
    ```

    名前を入力すると、Blocklet 用の新しい分散型識別子 (DID) が自動的に生成されます。この名前と DID はローカルの `~/.aigne/deployed.yaml` に保存されるため、同じプロジェクトの以降のデプロイでは再度尋ねられることはありません。

4.  **バンドル**: 次に CLI は `blocklet bundle --create-release` を呼び出します。これにより、Agent、その依存関係、および必要なすべての設定が、単一のデプロイ可能な `.blocklet/bundle` ファイルにパッケージ化されます。

5.  **デプロイ**: 最後に、バンドルされたアプリケーションは `blocklet deploy` コマンドを使用して、指定された `--endpoint` にプッシュされます。

プロセスが完了すると、ターミナルに確認メッセージが表示されます。

```
✅ Deploy completed: /path/to/your/project -> <your-endpoint-url>
```

これで、あなたの AIGNE Agent は Blocklet として稼働し、本番環境で実行できる状態になりました。