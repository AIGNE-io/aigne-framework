---
labels: ["Reference"]
---

# aigne hub

`aigne hub` コマンドは、AIGNE Hub への接続を管理するための中心的なツールです。Hub は、管理された大規模言語モデルへのアクセスを提供し、API キーの管理を行い、クレジット使用量を追跡します。Hub が提供するモデルを利用する Agent を実行するには、Hub 接続を適切に設定することが不可欠です。

このコマンドセットを使用すると、新しい Hub（公式の Arcblock Hub とセルフホストインスタンスの両方）に接続し、既存の接続を一覧表示し、それらを切り替え、アカウントのステータスを監視できます。

## 使用法

```bash 基本的なコマンド構造
aigne hub <subcommand>
```

## コマンド

`aigne hub` コマンドには、Hub 接続のさまざまな側面を管理するためのいくつかのサブコマンドが含まれています。

| コマンド | エイリアス | 説明 |
|---|---|---|
| `connect [url]` | | 新しい AIGNE Hub に接続します。 |
| `list` | `ls` | 設定済みのすべての AIGNE Hub 接続を一覧表示します。 |
| `use` | | アクティブな AIGNE Hub を切り替えます。 |
| `status` | `st` | 現在アクティブな AIGNE Hub を表示します。 |
| `remove` | `rm` | 設定済みの AIGNE Hub 接続を削除します。 |
| `info` | `i` | 特定の Hub 接続の詳細情報を表示します。 |

---

### `connect [url]`

ローカル CLI を AIGNE Hub インスタンスに接続します。このプロセスはマシンを認証し、将来のリクエストのために API キーを `~/.aigne/aigne-hub-connected.yaml` ファイルに保存します。

**使用法**

```bash Hub への接続
aigne hub connect [url]
```

**動作**

- **対話モード**: URL を指定せずにコマンドを実行すると、対話型のプロンプトが表示され、公式の AIGNE Hub またはカスタムのセルフホスト Hub URL を選択できます。

  ```bash 対話的な接続 icon=mdi:console
  $ aigne hub connect
  ? Choose a hub to connect: › - Use arrow-keys. Return to submit.
  ❯   Official Hub (https://hub.aigne.io)
      Custom Hub URL
  ```

- **直接モード**: URL を指定すると、CLI はその特定の Hub に直接接続しようとします。

  ```bash 直接接続 icon=mdi:console
  $ aigne hub connect https://my-hub.example.com
  ```

どちらの場合も、ブラウザウィンドウが開き、CLI 接続の認証と認可を行います。完了すると、認証情報がローカルに保存されます。

### `list`

これまでに接続したすべての AIGNE Hub のテーブルを表示します。また、どの Hub が現在アクティブであるかを示します。

**使用法**

```bash 接続の一覧表示
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

アクティブな AIGNE Hub を切り替えます。このコマンドは、複数の Hub 接続（例：個人アカウントとチームアカウント）があり、`aigne run` のようなコマンドでデフォルトで使用する Hub を変更する必要がある場合に便利です。

**使用法**

```bash アクティブな Hub の切り替え
aigne hub use
```

**動作**

このコマンドを実行すると、保存されている Hub 接続の対話型リストが表示されます。アクティブにしたいものを選択してください。

```bash 対話的な切り替え icon=mdi:console
$ aigne hub use
? Choose a hub to switch to: › - Use arrow-keys. Return to submit.
    https://hub.aigne.io
❯   https://my-hub.example.com

✓ Switched active hub to https://my-hub.example.com
```

### `status`

現在アクティブな AIGNE Hub の URL とその接続ステータスを素早く表示します。

**使用法**

```bash ステータスの確認
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

保存されている AIGNE Hub 接続をローカルの設定ファイルから削除します。

**使用法**

```bash Hub の削除
aigne hub remove
# またはエイリアスを使用
aigne hub rm
```

**動作**

このコマンドは、保存されている Hub 接続の中から削除したいものを選択するよう、対話形式でプロンプトを表示します。

```bash 対話的な削除 icon=mdi:console
$ aigne hub remove
? Choose a hub to remove: › https://my-hub.example.com

✓ Hub https://my-hub.example.com removed
```

### `info`

選択した Hub 接続の詳細なアカウント情報を取得して表示します。これには、ユーザーの詳細、クレジット残高、重要なリンクが含まれます。

**使用法**

```bash Hub 情報の取得
aigne hub info
# またはエイリアスを使用
aigne hub i
```

**動作**

まず、設定済みの Hub を選択するよう促されます。その後、CLI はその接続ステータスとアカウントの詳細を表示します。

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
