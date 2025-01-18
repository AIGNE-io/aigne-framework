# FunctionAgent SDK Example

This example demo how to use the LLMAgent

## Basic Usage

```typescript
import {FunctionAgent} from '@aigne/core'
import {Runtime} from '@aigne/runtime'

const agent = FunctionAgent.create({
  context: new Runtime(),
  inputs: {
    question: {
      type: 'string',
      required: true,
    },
  },
  outputs: {
    $text: {type: 'string', required: true},
  },
  code: `return { $text: \`ECHO: \${question}\` };`,
})

const result = await agent.run({question: 'hello'})
```

#### Example Output

```javascript
{
  $text: 'ECHO: hello'
}
```
