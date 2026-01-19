# @aigne/afs-utils

Utility functions for AIGNE AFS modules.

## Overview

This package provides shared utility functions used across AIGNE AFS modules, including:

- **Type utilities**: Type checking, validation, and manipulation helpers
- **Schema utilities**: Zod schema helpers for validation and transformation
- **Camelize utilities**: Object key transformation between camelCase and snake_case

## Installation

```bash
npm install @aigne/afs-utils
```

## Features

- **Type checking and validation** - Runtime type checking utilities
- **Zod schema parsing** - Parse and validate with human-readable error messages
  - Synchronous and asynchronous validation support
  - Optional error message prefix for better context
  - Customizable error message formatting
- **Object key transformation** - Convert between camelCase and snake_case
  - Shallow and deep conversion modes
  - Zod schema preprocessing support

## API

### Type Utilities

- `isNil(value)` - Check if value is null or undefined
- `isRecord(value)` - Check if value is a plain object
- `isEmpty(obj)` - Check if object/array/string is empty
- `isNonNullable(value)` - Type guard for non-nullable values
- `get(obj, path)` - Safe nested property access

### Schema Utilities

- `zodParse(schema, data, options?)` - Parse and validate data with Zod schema and human-readable error messages
  - `options.prefix` - Optional prefix for error messages
  - `options.prefixSeparator` - Separator between prefix and error message (default: `": "`)
  - `options.async` - Use async parsing with `parseAsync` for async refinements (default: `false`)
- `optionalize(schema)` - Make Zod schema optional
- `camelizeSchema(schema, options)` - Transform object keys to camelCase
- `preprocessSchema(fn, schema)` - Apply preprocessing to schema

### Camelize Utilities

- `camelize(obj, shallow?)` - Convert object keys to camelCase
- `snakelize(obj, shallow?)` - Convert object keys to snake_case

## License

Elastic-2.0
