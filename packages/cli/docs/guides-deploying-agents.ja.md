---
labels: ["Reference"]
---

# Agentのデプロイ

AIGNEプロジェクトをデプロイすると、ローカルの開発セットアップからBlockletとして知られる自己完結型の配布可能なアプリケーションに変換されます。これにより、Agentは本番環境で実行され、他のユーザーと共有され、より広範なBlockletエコシステムにシームレスに統合できます。`aigne deploy`コマンドは、このパッケージングとデプロイのプロセス全体を自動化します。

このガイドでは、デプロイのワークフローについて説明します。利用可能なすべてのコマンドオプションの詳細については、[`aigne deploy`コマンドリファレンス](./command-reference-deploy.md)を参照してください。

## デプロイプロセス

`aigne deploy`コマンドは、Agentを準備、設定、バンドル、デプロイするための一連のステップを調整します。内部では`@blocklet/cli`を利用して、Blocklet作成の複雑さを処理します。

以下に、デプロイフローの概要を示します。

```d2
direction: down

Developer: {
  shape: c4-person
  label: "開発者"
}

AIGNE-CLI: {
  label: "AIGNE CLI"
}

Blocklet-CLI: {
  label: "Blocklet CLI"
}

Deployment-Endpoint: {
  label: "デプロイエンドポイント"
  shape: cylinder
}

Local-Project: {
  label: "あなたのAIGNEプロジェクト"
  shape: rectangle
  aigne-yaml: {
    label: "aigne.yaml"
  }
  source-code: {
    label: "ソースコード"
  }
}

Developer -> AIGNE-CLI: "1. `aigne deploy` を実行"
AIGNE-CLI -> Local-Project.aigne-yaml: "2. プロジェクト設定を読み込む"
AIGNE-CLI -> AIGNE-CLI: "3. 一時的な .deploy ディレクトリを準備"
AIGNE-CLI -> Blocklet-CLI: "4. CLIの確認 / インストールのプロンプト"
AIGNE-CLI -> Developer: "5. Blocklet名の入力を求める"
Developer -> AIGNE-CLI: "6. 名前を提供する"
AIGNE-CLI -> Blocklet-CLI: "7. Blocklet DIDを作成"
Blocklet-CLI -> AIGNE-CLI: "8. DIDを返す"
AIGNE-CLI -> AIGNE-CLI: "9. blocklet.ymlを設定"
AIGNE-CLI -> Blocklet-CLI: "10. プロジェクトをバンドル"
Blocklet-CLI -> Deployment-Endpoint: "11. バンドルをデプロイ"
AIGNE-CLI -> Developer: "12. 成功メッセージを表示"

```

### ステップバイステップのウォークスルー

プロジェクトをデプロイするには、プロジェクトのルートディレクトリに移動し、プロジェクトへのパスとターゲットエンドポイントを指定してデプロイコマンドを実行します。

```bash Command icon=lucide:terminal
aigne deploy --path . --endpoint <your-endpoint-url>
```

このコマンドを実行したときに何が起こるかを詳しく見ていきましょう。

1.  **環境準備**: CLIはまず一時的な`.deploy`ディレクトリを作成します。そこへ標準のBlockletテンプレートと共にプロジェクトファイルをコピーします。次に、このディレクトリ内で`npm install`を実行し、必要な依存関係を取得します。

2.  **Blocklet CLIの確認**: プロセスは`@blocklet/cli`がシステムにインストールされているかを確認します。インストールされていない場合、グローバルにインストールする許可を求めるプロンプトが表示されます。これは一度限りのセットアップです。

    ```
    ? Install Blocklet CLI? ›
    ❯ yes
      no
    ```

3.  **Blockletの設定（初回デプロイ時）**: このプロジェクトを初めてデプロイする場合、CLIはBlockletの名前を尋ねます。`aigne.yaml`内のAgent名またはプロジェクトのフォルダ名に基づいてデフォルト名を提案します。

    ```
    ? Please input agent blocklet name: › my-awesome-agent
    ```

    名前を提供すると、Blocklet用の新しい分散型識別子（DID）が自動的に生成されます。この名前とDIDはローカルの`~/.aigne/deployed.yaml`に保存されるため、同じプロジェクトの次回以降のデプロイでは尋ねられません。

4.  **バンドル**: 次にCLIは`blocklet bundle --create-release`を呼び出します。これにより、Agent、その依存関係、および必要なすべての設定が、単一のデプロイ可能な`.blocklet/bundle`ファイルにパッケージ化されます。

5.  **デプロイ**: 最後に、バンドルされたアプリケーションが`blocklet deploy`コマンドを使用して、指定された`--endpoint`にプッシュされます。

プロセスが完了すると、ターミナルに確認メッセージが表示されます。

```
✅ Deploy completed: /path/to/your/project -> <your-endpoint-url>
```

これで、あなたのAIGNE AgentはBlockletとして稼働し、本番環境で実行できる状態になりました。
