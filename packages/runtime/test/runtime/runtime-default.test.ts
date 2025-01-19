import {expect, test} from 'bun:test'

import {AIGNERuntime} from '../../src'

test('Runtime.default', async () => {
  const runtime = new AIGNERuntime()

  expect(runtime.id).toEqual('default-runtime')
  expect(runtime.state).toEqual({})
  expect(runtime.name).toBeUndefined()
})
