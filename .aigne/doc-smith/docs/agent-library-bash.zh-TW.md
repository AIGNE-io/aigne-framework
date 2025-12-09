# Bash

`BashAgent` 可以在 AIGNE 工作流程中執行 shell 指令及腳本。本指南詳細介紹其設定與用法，讓您可以直接與底層作業系統互動，執行檔案操作、程序管理、自動化命令列工具等任務。

## 概覽

`BashAgent` 扮演著 AIGNE 框架與標準 Bash shell 之間的橋樑。其設計旨在執行 shell 腳本，擷取其標準輸出（`stdout`）、標準錯誤（`stderr`）和退出碼，並將這些資訊作為結構化輸出回傳。

為確保安全，此 agent 預設在隔離的沙箱環境中執行指令。這可以防止腳本存取未經授權的網路資源或意外修改檔案系統。沙箱行為是可設定的，既可以進行安全的隔離執行，也可以在必要時進行無限制的執行。

下圖說明了 `BashAgent` 的工作流程，從接收腳本到回傳輸出，其中包含可選的沙箱層。

<!-- DIAGRAM_IMAGE_START:flowchart:16:9 -->
![Bash](assets/diagram/agent-library-bash-01.jpg)
<!-- DIAGRAM_IMAGE_END -->

## 輸入

此 agent 接受一個 `script` 屬性，其中包含要執行的 Bash 指令。

<x-field-group>
  <x-field data-name="script" data-type="string" data-required="true" data-desc="要執行的 bash 腳本或指令。"></x-field>
</x-field-group>

## 輸出

完成後，此 agent 會回傳一個物件，其中包含輸出流和腳本的最終退出碼。

<x-field-group>
  <x-field data-name="stdout" data-type="string" data-required="false" data-desc="腳本產生的標準輸出。"></x-field>
  <x-field data-name="stderr" data-type="string" data-required="false" data-desc="腳本產生的標準錯誤輸出。"></x-field>
  <x-field data-name="exitCode" data-type="number" data-required="false" data-desc="腳本完成時回傳的退出碼。"></x-field>
</x-field-group>

## 設定

`BashAgent` 在實例化時可傳入一個可選的 `options` 物件，以控制其執行環境。

```typescript agent.ts
import { BashAgent } from "@aigne/agent-library/bash";

// 預設行為：在安全的沙箱中執行
const secureAgent = new BashAgent({});

// 停用沙箱以進行無限制的執行
const insecureAgent = new BashAgent({
  sandbox: false,
});

// 設定沙箱以允許特定的網路存取
const configuredAgent = new BashAgent({
  sandbox: {
    network: {
      allowedDomains: ["api.example.com"],
    },
  },
});
```

### 選項

<x-field-group>
  <x-field data-name="sandbox" data-type="boolean | object" data-required="false">
    <x-field-desc markdown>控制沙箱執行環境。若為 `false`，則停用沙箱。若為 `object`，則設定沙箱規則。預設啟用沙箱並採用限制性設定。</x-field-desc>
    <x-field data-name="network" data-type="object" data-required="false" data-desc="設定網路存取規則。">
      <x-field data-name="allowedDomains" data-type="string[]" data-required="false" data-desc="允許腳本存取的網域清單。"></x-field>
      <x-field data-name="deniedDomains" data-type="string[]" data-required="false" data-desc="明確禁止腳本存取的網域清單。"></x-field>
    </x-field>
    <x-field data-name="filesystem" data-type="object" data-required="false" data-desc="設定檔案系統存取規則。">
      <x-field data-name="allowWrite" data-type="string[]" data-required="false" data-desc="允許腳本寫入的檔案路徑或目錄清單。"></x-field>
      <x-field data-name="denyRead" data-type="string[]" data-required="false" data-desc="禁止腳本讀取的檔案路徑或目錄清單。"></x-field>
      <x-field data-name="denyWrite" data-type="string[]" data-required="false" data-desc="禁止腳本寫入的檔案路徑或目錄清單。"></x-field>
    </x-field>
  </x-field>
</x-field-group>

:::warning
透過設定 `sandbox: false` 來停用沙箱，會讓腳本以與父 Node.js 程序相同的權限執行。這只應在受信任的環境中進行，因為它可能帶來安全風險。
:::

## 範例

### 基本腳本執行

此範例展示如何執行一個簡單的腳本，該腳本會同時輸出到 `stdout` 和 `stderr`，然後退出。

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

執行將產生以下輸出，擷取了輸出流和成功的退出碼。

```json
{
  "stdout": "Hello, World!\n",
  "stderr": "This is an error message\n",
  "exitCode": 0
}
```

### 停用沙箱

此範例展示如何停用沙箱以執行需要無限制網路存取的指令，例如 `curl`。

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

輸出將包含網頁的 HTML 內容和退出碼 `0`。

```html
<html><head><title>Object moved</title></head><body>
<h2>Object moved to <a href="https://www.bing.com:443/?toWww=1&amp;redig=D26DC3A15DA244F9AB9D1A420426F9E5">here</a>.</h2>
</body></html>
```

```
0
```

### 在沙箱中設定網路存取

此範例展示如何授權沙箱中的腳本存取特定網域。嘗試存取未經授權的網域將會失敗。

```typescript example-sandbox-network.ts
import { BashAgent } from "@aigne/agent-library/bash";

const bashAgent = new BashAgent({
  sandbox: {
    network: {
      allowedDomains: ["bing.com"],
    },
  },
});

// 此指令將成功，因為 bing.com 是允許的網域。
const resultAuthorized = await bashAgent.invoke({ script: "curl https://bing.com" });
console.log("Authorized request exit code:", resultAuthorized.exitCode); // 0

// 此指令將失敗，因為 google.com 不在允許清單中。
const resultUnauthorized = await bashAgent.invoke({ script: "curl https://google.com" });
console.log("Unauthorized request exit code:", resultUnauthorized.exitCode); // 56
console.error(resultUnauthorized.stderr); // curl: (56) CONNECT tunnel failed, response 403
```

第一個指令成功，回傳退出碼 `0`。第二個指令失敗，因為沙箱封鎖了網路請求，導致非零的退出碼和來自 `curl` 的錯誤訊息。