---
labels: ["Reference"]
---

# aigne hub

`aigne hub` コマンドは、AIGNE Hubへの接続を管理するための中核となるツールです。Hubは、マネージド大規模言語モデルへのアクセスを提供し、APIキー管理を処理し、クレジット使用量を追跡します。Hubが提供するモデルを利用するAgentを実行するには、Hub接続を適切に設定することが不可欠です。

このコマンドセットを使用すると、新しいHub（公式のArcblock Hubおよびセルフホストインスタンスの両方）に接続し、既存の接続を一覧表示し、それらを切り替え、アカウントの状態を監視できます。

## 使用法

```bash 基本的なコマンド構造
aigne hub <subcommand>
```

## コマンド

`aigne hub` コマンドには、Hub接続のさまざまな側面を管理するためのいくつかのサブコマンドが含まれています。

| Command | Alias | Description |
|---|---|---|
| `connect [url]` | | 新しいAIGNE Hubに接続します。 |
| `list` | `ls` | 設定済みのすべてのAIGNE Hub接続を一覧表示します。 |
| `use` | | アクティブなAIGNE Hubを切り替えます。 |
| `status` | `st` | 現在アクティブなAIGNE Hubを表示します。 |
| `remove` | `rm` | 設定済みのAIGNE Hub接続を削除します。 |
| `info` | `i` | 特定のHub接続の詳細情報を表示します。 |

---

### `connect [url]`

ローカルCLIをAIGNE Hubインスタンスに接続します。このプロセスはマシンを認証し、将来のリクエストのためのAPIキーを `~/.aigne/aigne-hub-connected.yaml` ファイルに保存します。

**使用法**

```bash Hubに接続
aigne hub connect [url]
```

**動作**

- **インタラクティブモード**: URLなしでコマンドを実行すると、インタラクティブなプロンプトが表示され、公式のAIGNE HubまたはカスタムのセルフホストHub URLのいずれかを選択できます。

  ```bash インタラクティブ接続 icon=mdi:console
  $ aigne hub connect
  ? Choose a hub to connect: › - Use arrow-keys. Return to submit.
  ❯   Official Hub (https://hub.aigne.io)
      Custom Hub URL
  ```

- **ダイレクトモード**: URLを指定すると、CLIはその特定のHubに直接接続しようとします。

  ```bash ダイレクト接続 icon=mdi:console
  $ aigne hub connect https://my-hub.example.com
  ```

どちらの場合も、ブラウザウィンドウが開き、CLI接続を認証および承認します。完了すると、認証情報がローカルに保存されます。

### `list`

以前に接続したすべてのAIGNE Hubのテーブルを表示します。また、現在どのHubがアクティブであるかも示します。

**使用法**

```bash 接続を一覧表示
aigne hub list
# またはエイリアスを使用
aigne hub ls
```

**出力例**

```bash icon=mdi:table
$ aigne hub ls
Connected AIGNE Hubs:

┌───────────────────────────────────────────────────┬────────┐
│ URL                                               │ ACTIVE │
├───────────────────────────────────────────────────┼────────┤
│ https://hub.aigne.io                              │ YES    │
├───────────────────────────────────────────────────┼────────┤
│ https://my-hub.example.com                        │ NO     │
└───────────────────────────────────────────────────┴────────┘
Use 'aigne hub use' to switch to a different hub.
```

### `use`

アクティブなAIGNE Hubを切り替えます。このコマンドは、複数のHub接続（例：個人アカウントとチームアカウント）があり、`aigne run`のようなコマンドでデフォルトで使用されるものを変更する必要がある場合に便利です。

**使用法**

```bash アクティブなHubを切り替え
aigne hub use
```

**動作**

このコマンドを実行すると、保存されているHub接続のインタラクティブなリストが表示されます。アクティブにしたいものを選択してください。

```bash インタラクティブな切り替え icon=mdi:console
$ aigne hub use
? Choose a hub to switch to: › - Use arrow-keys. Return to submit.
    https://hub.aigne.io
❯   https://my-hub.example.com

✓ Switched active hub to https://my-hub.example.com
```

### `status`

現在アクティブなAIGNE HubのURLとその接続状態を素早く表示します。

**使用法**

```bash 状態を確認
aigne hub status
# またはエイリアスを使用
aigne hub st
```

**出力例**

```bash icon=mdi:console
$ aigne hub status
Active hub: https://hub.aigne.io - online
```

### `remove`

保存されたAIGNE Hub接続をローカルの設定ファイルから削除します。

**使用法**

```bash Hubを削除
aigne hub remove
# またはエイリアスを使用
aigne hub rm
```

**動作**

このコマンドは、削除したい保存済みのHub接続を選択するようインタラクティブに促します。

```bash インタラクティブな削除 icon=mdi:console
$ aigne hub remove
? Choose a hub to remove: › https://my-hub.example.com

✓ Hub https://my-hub.example.com removed
```

### `info`

選択したHub接続の詳細なアカウント情報を取得して表示します。これには、ユーザー詳細、クレジット残高、および重要なリンクが含まれます。

**使用法**

```bash Hub情報を取得
aigne hub info
# またはエイリアスを使用
aigne hub i
```

**動作**

まず、設定済みのHubを選択するよう促されます。次に、CLIがその接続状態とアカウント詳細を表示します。

**出力例**

```bash icon=mdi:information-outline
$ aigne hub info

AIGNE Hub Connection
──────────────────────────────────────────────
Hub:       https://hub.aigne.io
Status:    Connected ✅

User:
  Name:    John Doe
  DID:     z2qa...w9vM
  Email:   john.doe@example.com

Credits:
  Used:    1,234
  Total:   100,000

Links:
  Payment: https://hub.aigne.io/payment/...
  Profile: https://hub.aigne.io/profile/...
```
