# Bash

`BashAgent` を使用すると、AIGNE ワークフロー内でシェルコマンドとスクリプトを実行できます。このガイドでは、その設定と使用方法について詳しく説明し、ファイル操作、プロセス管理、コマンドラインツールの自動化などのタスクのために、基盤となるオペレーティングシステムと直接対話できるようにします。

## 概要

`BashAgent` は AIGNE フレームワークと標準の Bash シェルとの間のブリッジとして機能します。シェルスクリプトを実行し、その標準出力 (`stdout`)、標準エラー (`stderr`)、および終了コードをキャプチャし、この情報を構造化された出力として返すように設計されています。

セキュリティのため、Agent はデフォルトで隔離されたサンドボックス環境内でコマンドを実行します。これにより、スクリプトが不正なネットワークリソースにアクセスしたり、予期せずファイルシステムを変更したりすることを防ぎます。サンドボックスの動作は設定可能で、安全な隔離実行と、必要に応じた無制限の実行の両方が可能です。

以下の図は、`BashAgent` のワークフローを示しています。スクリプトの受信から出力の返却まで、オプションのサンドボックスレイヤーを含みます。

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![Bash](assets/diagram/agent-library-bash-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 入力

Agent は、実行する Bash コマンドを含む単一の `script` プロパティを受け入れます。

<x-field-group>
  <x-field data-name="script" data-type="string" data-required="true" data-desc="実行する Bash スクリプトまたはコマンド。"></x-field>
</x-field-group>

## 出力

完了すると、Agent は出力ストリームとスクリプトの最終終了コードを含むオブジェクトを返します。

<x-field-group>
  <x-field data-name="stdout" data-type="string" data-required="false" data-desc="スクリプトによって生成された標準出力。"></x-field>
  <x-field data-name="stderr" data-type="string" data-required="false" data-desc="スクリプトによって生成された標準エラー出力。"></x-field>
  <x-field data-name="exitCode" data-type="number" data-required="false" data-desc="完了時にスクリプトによって返された終了コード。"></x-field>
</x-field-group>

## 設定

`BashAgent` は、その実行環境を制御するために、オプションの `options` オブジェクトでインスタンス化されます。

```typescript agent.ts
import { BashAgent } from "@aigne/agent-library/bash";

// デフォルトの動作：安全なサンドボックスで実行
const secureAgent = new BashAgent({});

// 無制限の実行のためにサンドボックスを無効化
const insecureAgent = new BashAgent({
  sandbox: false,
});

// 特定のネットワークアクセスを許可するようにサンドボックスを設定
const configuredAgent = new BashAgent({
  sandbox: {
    network: {
      allowedDomains: ["api.example.com"],
    },
  },
});
```

### オプション

<x-field-group>
  <x-field data-name="sandbox" data-type="boolean | object" data-required="false">
    <x-field-desc markdown>サンドボックス化された実行環境を制御します。`false` の場合、サンドボックスは無効になります。`object` の場合、サンドボックスのルールを設定します。デフォルトでは、サンドボックスは制限的な設定で有効になっています。</x-field-desc>
    <x-field data-name="network" data-type="object" data-required="false" data-desc="ネットワークアクセスルールを設定します。">
      <x-field data-name="allowedDomains" data-type="string[]" data-required="false" data-desc="スクリプトがアクセスを許可されているドメインのリスト。"></x-field>
      <x-field data-name="deniedDomains" data-type="string[]" data-required="false" data-desc="スクリプトが明示的にアクセスを禁止されているドメインのリスト。"></x-field>
    </x-field>
    <x-field data-name="filesystem" data-type="object" data-required="false" data-desc="ファイルシステムアクセスルールを設定します。">
      <x-field data-name="allowWrite" data-type="string[]" data-required="false" data-desc="スクリプトが書き込みを許可されているファイルパスまたはディレクトリのリスト。"></x-field>
      <x-field data-name="denyRead" data-type="string[]" data-required="false" data-desc="スクリプトが読み取りを禁止されているファイルパスまたはディレクトリのリスト。"></x-field>
      <x-field data-name="denyWrite" data-type="string[]" data-required="false" data-desc="スクリプトが書き込みを禁止されているファイルパスまたはディレクトリのリスト。"></x-field>
    </x-field>
  </x-field>
</x-field-group>

:::warning
`sandbox: false` を設定してサンドボックスを無効にすると、スクリプトは親の Node.js プロセスと同じ権限で実行されます。これはセキュリティリスクを引き起こす可能性があるため、信頼できる環境でのみ行うべきです。
:::

## 例

### 基本的なスクリプトの実行

この例では、`stdout` と `stderr` の両方に出力して終了する単純なスクリプトの実行を示します。

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

この実行により、以下の出力が生成され、ストリームと成功した終了コードがキャプチャされます。

```json
{
  "stdout": "Hello, World!\n",
  "stderr": "This is an error message\n",
  "exitCode": 0
}
```

### サンドボックスの無効化

この例では、無制限のネットワークアクセスを必要とする `curl` などのコマンドを実行するために、サンドボックスを無効にする方法を示します。

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

出力には、ウェブページの HTML コンテンツと終了コード `0` が含まれます。

```html
<html><head><title>Object moved</title></head><body>
<h2>Object moved to <a href="https://www.bing.com:443/?toWww=1&amp;redig=D26DC3A15DA244F9AB9D1A420426F9E5">here</a>.</h2>
</body></html>
```

```
0
```

### サンドボックスでのネットワークアクセスの設定

この例では、サンドボックス化されたスクリプトに特定のドメインへのアクセスを許可する方法を示します。許可されていないドメインへのアクセス試行は失敗します。

```typescript example-sandbox-network.ts
import { BashAgent } from "@aigne/agent-library/bash";

const bashAgent = new BashAgent({
  sandbox: {
    network: {
      allowedDomains: ["bing.com"],
    },
  },
});

// bing.com は許可されたドメインのため、このコマンドは成功します。
const resultAuthorized = await bashAgent.invoke({ script: "curl https://bing.com" });
console.log("Authorized request exit code:", resultAuthorized.exitCode); // 0

// google.com は許可リストにないため、このコマンドは失敗します。
const resultUnauthorized = await bashAgent.invoke({ script: "curl https://google.com" });
console.log("Unauthorized request exit code:", resultUnauthorized.exitCode); // 56
console.error(resultUnauthorized.stderr); // curl: (56) CONNECT tunnel failed, response 403
```

最初のコマンドは成功し、終了コード `0` を返します。2番目のコマンドは、サンドボックスがネットワークリクエストをブロックするため失敗し、ゼロ以外の終了コードと `curl` からのエラーメッセージが返されます。