---
labels: ["Reference"]
---

# aigne observe

`aigne observe` コマンドは、Agent の実行データを監視および分析するためのローカル Web サーバーを起動します。トレースの検査、詳細な呼び出し情報の表示、実行中の Agent の動作を理解するための使いやすいインターフェースを提供します。このツールは、デバッグ、パフォーマンスチューニング、および Agent が情報をどのように処理し、さまざまなツールやモデルとどのように相互作用するかについての深い洞察を得るために不可欠です。

## 使用法

オブザーバビリティサーバーを起動するには、ターミナルで次のコマンドを実行します。

```bash Usage icon=lucide:terminal
aigne observe [options]
```

起動すると、CLI はサーバーの URL とローカルのオブザーバビリティデータベースへのパスを出力します。

![AIGNE オブザーバビリティサーバーの実行インターフェース](../assets/observe/observe-running-interface.png)

## 仕組み

`observe` コマンドは、AIGNE がすべての実行トレースを保存するローカルの SQLite データベースから読み取る Web アプリケーションを起動します。Agent を実行するたびに (`aigne run` または `aigne serve-mcp` を使用)、フレームワークは実行フローの詳細なログを自動的に記録します。これらのログは、オブザーバビリティ UI で検査できるようになります。

UI を使用すると、記録されたすべてのトレースのリストを閲覧し、特定のトレースにドリルダウンして、入力、出力、ツール呼び出し、モデルの応答など、Agent の操作のステップバイステップの内訳を確認できます。

![AIGNE オブザーバビリティ UI で呼び出し詳細を表示](../assets/observe/observe-view-call-details.png)

## オプション

<x-field data-name="--host" data-type="string" data-default="localhost" data-desc="サーバーのホストアドレスを指定します。ローカルネットワーク上の他のデバイスにサーバーを公開するには `0.0.0.0` を使用します。"></x-field>
<x-field data-name="--port" data-type="number" data-default="7890" data-desc="サーバーがリッスンするポート番号を設定します。指定したポートが利用できない場合、次に利用可能なポートを探します。`PORT` 環境変数を介して設定することもできます。"></x-field>

## 例

### デフォルトポートでサーバーを起動する

オプションなしでコマンドを実行すると、サーバーはデフォルト設定で起動します。

```bash Start with default settings icon=lucide:play
aigne observe
```

**期待される出力:**

```text Console Output
Observability database path: /path/to/your/project/.aigne/observability.db
Observability server is running at http://localhost:7890
```

その後、Web ブラウザで `http://localhost:7890` を開いて UI にアクセスできます。

### 特定のポートでサーバーを起動する

`--port` オプションを使用して、別のポートを指定します。

```bash Start on a custom port icon=lucide:play-circle
aigne observe --port 8080
```

これにより、サーバーは `http://localhost:8080` (または 8080 が使用中の場合は次に利用可能なポート) で起動します。

### ローカルネットワークにサーバーを公開する

ネットワーク上の他のデバイスがオブザーバビリティ UI にアクセスできるようにするには、ホストを `0.0.0.0` に設定します。

```bash Expose the server publicly icon=lucide:globe
aigne observe --host 0.0.0.0
```

サーバーは `http://<your-local-ip>:7890` でアクセスできるようになります。
