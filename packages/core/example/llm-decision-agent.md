# LLMDecisionAgent SDK Example

This example demo how to use the LLMDecisionAgent

## Basic Usage

```typescript
import {LLMDecisionAgent} from '@aigne/core'
import {Runtime} from '@aigne/runtime'

const agent = LLMDecisionAgent.create({
  context,
  messages: [{role: 'user', content: 'this is user message'}],
  cases: {
    case1: {
      description: 'Case 1',
      runnable: LocalFunctionAgent.create({
        context,
        inputs: {
          question: {
            type: 'string',
            required: true,
          },
        },
        outputs: {
          $text: {
            type: 'string',
            required: true,
          },
        },
        function: async ({question}) => {
          return {$text: `ECHO: ${question}`}
        },
      }),
    },
    case2: {
      description: 'Case 2',
      runnable: LocalFunctionAgent.create({
        context,
        inputs: {
          str: {
            type: 'string',
            required: true,
          },
        },
        outputs: {
          length: {
            type: 'number',
            required: true,
          },
        },
        function: async ({str}) => {
          return {length: str.length}
        },
      }),
    },
  },
})
```

#### Example Output

##### Case 1

```javascript
Input: {question: "hello", str: "foo" }
Output:{$text: "ECHO: hello",}
```

##### Case 2

```javascript
Input: {question: "hello", str: "foo" }
Output: {length: 3}
```
