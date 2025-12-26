# @aigne/afs-i18n-driver

AIGNE AFS driver for i18n translation. This driver enables automatic translation of files to different languages using AI.

## Installation

```bash
npm install @aigne/afs-i18n-driver
```

## Usage

```typescript
import { AFS } from "@aigne/afs";
import { I18nDriver } from "@aigne/afs-i18n-driver";
import { LocalFS } from "@aigne/afs-local-fs";
import { AIGNE } from "@aigne/core";

// Create context
const aigne = new AIGNE({ model: yourModel });
const context = aigne.newContext();

// Create i18n driver with context
const i18nDriver = new I18nDriver({
  context,
  defaultSourceLanguage: "zh",
  supportedLanguages: ["en", "ja", "ko"],
});

// Create AFS with i18n driver
const afs = new AFS({
  modules: [new LocalFS({ localPath: "./docs" })],
  drivers: [i18nDriver],
});

// Read translated version
const result = await afs.read("/modules/local-fs/intro.md", {
  view: { language: "en" },
  wait: "strict",
});
```

## Configuration

### I18nDriverOptions

- `context` (required): AIGNE context for invoking the translation agent
- `defaultSourceLanguage` (optional): Default source language code (e.g., "zh")
- `supportedLanguages` (optional): Array of supported target language codes
- `translationAgent` (optional): Custom translation agent (uses built-in agent if not provided)
- `storagePath` (optional): Storage path template (default: `.i18n/{language}/`)

## License

Elastic-2.0
