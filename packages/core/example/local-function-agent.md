# LocalFunctionAgent SDK Example

This example demo how to use the LocalFunctionAgent

## Basic Usage

```typescript
import {LocalFunctionAgent} from '@aigne/core'
import {Runtime} from '@aigne/runtime'

const agent = LocalFunctionAgent.create({
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
  function: async ({question}) => {
    return {$text: `ECHO: ${question}`, question}
  },
})

const result = await agent.run({question: 'hello'})
```

#### Example Output

```javascript
{
  $text: 'ECHO: hello',
  question: 'hello'
}
```
