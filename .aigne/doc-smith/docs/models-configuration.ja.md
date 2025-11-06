# モデル設定

AIGNE フレームワークがサポートする様々な AI モデルを統合して利用するには、適切な環境変数を設定することが不可欠です。この設定には通常、認証用の API キーの提供が含まれ、プロバイダー固有の他の設定が含まれる場合もあります。このガイドは、サポートされている各モデルプロバイダーが必要とする環境変数に関する包括的なリファレンスとして機能します。

## プロバイダー設定

以下の表は、各 AI モデルプロバイダーに必要な環境変数の詳細です。フレームワークがそれぞれのサービスに認証して接続するためには、これらの変数を環境に設定する必要があります。

| プロバイダー | 環境変数 | 説明 |
| :--- | :--- | :--- |
| **AIGNE Hub** | `AIGNE_HUB_BASE_URL`<br/>`AIGNE_HUB_API_KEY` | AIGNE Hub インスタンスのベース URL と認証に必要な API キーを設定します。 |
| **Anthropic** | `ANTHROPIC_API_KEY` | Anthropic の Claude モデルにアクセスするための API キー。 |
| **AWS Bedrock** | `AWS_ACCESS_KEY_ID`<br/>`AWS_SECRET_ACCESS_KEY`<br/>`AWS_REGION` | AWS Bedrock を介してモデルにアクセスするための AWS 認証情報と特定のリージョン。 |
| **DeepSeek** | `DEEPSEEK_API_KEY` | DeepSeek のモデルにアクセスするための API キー。 |
| **Doubao** | `DOUBAO_API_KEY` | Doubao のモデルにアクセスするための API キー。 |
| **Google Gemini**| `GEMINI_API_KEY` | Google の Gemini モデルにアクセスするための API キー。 |
| **Ideogram** | `IDEOGRAM_API_KEY` | Ideogram の画像生成モデル用の API キー。 |
| **LMStudio** | `LM_STUDIO_BASE_URL`<br/>`LM_STUDIO_API_KEY` | ローカルの LMStudio サーバーのベース URL (例: `http://localhost:1234/v1`)。API キーは通常不要で、プレースホルダーがデフォルトになります。 |
| **Ollama** | `OLLAMA_DEFAULT_BASE_URL`<br/>`OLLAMA_API_KEY` | ローカルの Ollama インスタンスのベース URL (例: `http://localhost:11434/v1`)。API キーは通常 `ollama` のようなプレースホルダーです。 |
| **OpenAI** | `OPENAI_API_KEY` | GPT-4o などの OpenAI のモデルにアクセスするための API キー。 |
| **OpenRouter** | `OPEN_ROUTER_API_KEY` | OpenRouter サービスを介して様々なモデルにアクセスするための API キー。 |
| **Poe** | `POE_API_KEY` | Poe サービスを介して様々なモデルにアクセスするための API キー。 |
| **xAI** | `XAI_API_KEY` | xAI の Grok モデルにアクセスするための API キー。 |

## 環境変数の設定

アプリケーションを実行する前に、シェルでこれらの変数を設定できます。具体的なコマンドは、お使いのオペレーティングシステムによって異なります。

### macOS と Linux

`export` コマンドを使用して、現在のターミナルセッションの環境変数を設定します。

```bash OpenAI API キーを設定 icon=lucide:terminal
export OPENAI_API_KEY="your-openai-api-key"
```

セッションをまたいで変数を永続的にするには、`~/.bash_profile`、`~/.zshrc`、`~/.profile` などのシェルのプロファイルファイルに `export` コマンドを追加します。

### Windows

コマンドプロンプトでは `set` コマンドを、PowerShell では `$env:` を使用します。

**コマンドプロンプト:**
```powershell CMD で OpenAI API キーを設定 icon=lucide:terminal
set OPENAI_API_KEY="your-openai-api-key"
```

**PowerShell:**
```powershell PowerShell で OpenAI API キーを設定 icon=lucide:terminal
$env:OPENAI_API_KEY="your-openai-api-key"
```

Windows で環境変数を永続的に設定するには、システムのプロパティの「環境変数」ダイアログを使用します。

## まとめ

これらの環境変数を適切に設定することは、統合された AI モデルを使用するための前提条件です。使用する予定のプロバイダーに対して、正しいキーとその他の必要な値が設定されていることを確認してください。特定のモデルの使用に関する詳細なガイドについては、[OpenAI](./models-openai.md) や [Google Gemini](./models-gemini.md) など、各プロバイダーの個別のドキュメントページを参照してください。