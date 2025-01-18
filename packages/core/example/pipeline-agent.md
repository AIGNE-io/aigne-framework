# PipelineAgent SDK Example

This example demo how to use the PipelineAgent

## Basic Usage

```typescript
import {PipelineAgent} from '@aigne/core'
import {Runtime} from '@aigne/runtime'

const agent = PipelineAgent.create({
  context: new Runtime(),
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
      fromVariable: 'step1',
      fromVariablePropPath: ['$text'],
    },
    result: {
      type: 'number',
      required: true,
      fromVariable: 'step2',
      fromVariablePropPath: ['length'],
    },
  },
  processes: {
    step1: {
      runnable: LocalFunctionAgent.create({
        context: new Runtime(),
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
          return {$text: `step1: ${question}`}
        },
      }),
      input: {
        question: {
          fromVariable: 'question',
        },
      },
    },
    step2: {
      runnable: LocalFunctionAgent.create({
        context: new Runtime(),
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
      input: {
        str: {
          fromVariable: 'step1',
          fromVariablePropPath: ['$text'],
        },
      },
    },
  },
})

const result = await agent.run({question: 'hello'})
```

#### Example Output

```javascript
{
  $text: 'step1: hello',
  result: 9,
}
```
