# LLMAgent SDK Example

This example demo how to use the LLMAgent

## Basic Usage

```typescript
import {LLMAgent} from '@aigne/core'
import {Runtime} from '@aigne/runtime'

const agent = LLMAgent.create({
  context: new Runtime(),
  inputs: {
    question: {
      type: 'string',
      required: true,
    },
    language: {
      type: 'string',
    },
  },
  outputs: {
    $text: {type: 'string', required: true},
  },
  messages: [{role: 'user', content: 'output: {{question}} in {{language}}'}],
})

const result = await agent.run({question: 'hello', language: 'zh'})
```

#### Example Output

```javascript
{
  $text: '你好'
}
```

## Use With History

```typescript
import {LLMAgent} from '@aigne/core'
import {Runtime} from '@aigne/runtime'
import {ChatHistory} from '@aigne/memory'
import path from 'path'

const chatHistory = new ChatHistory({
  path: path.join(process.cwd(), '.data'),
})

const chat = LLMAgent.create({
  context: new Runtime(),
  name: 'chat',
  inputs: {
    question: {
      type: 'string',
      required: true,
    },
  },
  memories: {
    history: {
      name: 'chat-history',
      memory: chatHistory,
      primary: true,
      query: {
        fromVariable: 'question',
      },
      options: {
        k: 10,
      },
    },
  },
  modelOptions: {
    model: 'gpt-4o',
    temperature: 0.1,
  },
  messages: [
    {role: 'system', content: 'You are a AI chat bot, use memory to answer the question'},
    {role: 'user', content: '{{question}}'},
  ],
  outputs: {
    $text: {
      type: 'string',
      required: true,
    },
  },
})
```
