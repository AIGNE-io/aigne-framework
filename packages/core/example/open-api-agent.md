# OpenAPIAgent SDK Example

This example demo how to use the OpenAPIAgent

## Basic Usage

```typescript
import {OpenAPIAgent} from '@aigne/core'
import {Runtime} from '@aigne/runtime'

const agent = OpenAPIAgent.create({
  context: new Runtime(),
  inputs: {
    id: {
      type: 'string',
      required: true,
      in: 'path',
    },
    message: {
      type: 'string',
      in: 'query',
    },
    key: {
      type: 'string',
      in: 'header',
    },
  },
  outputs: {
    $text: {type: 'string', required: true},
  },
  url: 'https://api.example.com/test/{id}',
  method: 'get',
})

const result = await agent.run({id: '1', message: 'hello', key: 'value'})
```

#### Request Info

```javascript
{
  url: 'https://api.example.com/test/1',
  method: 'get',
  query: { message: 'hello' },
  headers: { key: 'value' },
  cookies: {},
  body: undefined
}
```
