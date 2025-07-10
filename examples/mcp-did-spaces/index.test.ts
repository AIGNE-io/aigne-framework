import { MCPAgent } from '@aigne/core';
import { test } from 'bun:test';
import dotenv from 'dotenv-flow';

dotenv.config({ silent: true });

test(
  'MCP DID Spaces skills test',
  async () => {
    const mcp = await MCPAgent.from({
      url: 'https://bbqa4abi4d7hjydb3qo5l7lyxduukztmhj3gpghkole.did.abtnet.io/app/mcp',
      transport: 'streamableHttp',
      opts: {
        requestInit: {
          headers: {
            Authorization:
              'Bearer blocklet-z7QAdYvhxBLVcHfFsLwRryKEjDgQ3aLM46ycEQViV2qSe',
          },
        },
      },
    });

    console.log('Available skills:', Object.keys(mcp.skills));

    const headSpace = mcp.skills['head_space'];
    if (headSpace) {
      const result = await headSpace.invoke({});
      console.log('Head space result:', result);
    }
  },
  1000 * 120
);
