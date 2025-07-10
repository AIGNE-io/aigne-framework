import { DIDSpacesMemory } from '@aigne/agent-library/did-spaces-memory/index.js';
import { AIGNE, AIAgent } from '@aigne/core';
import { OpenAIChatModel as Model } from '@aigne/openai';
import dotenv from 'dotenv-flow';

dotenv.config({ silent: true });

const aigne = new AIGNE({
  model: new Model({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'gpt-4o-mini',
  }),
});

const agent = AIAgent.from({
  instructions: 'You are a helpful assistant for Crypto market analysis',
  memory: new DIDSpacesMemory({
    url: 'https://bbqa4abi4d7hjydb3qo5l7lyxduukztmhj3gpghkole.did.abtnet.io/app',
    auth: {
      authorization:
        'Bearer blocklet-zGdxEzkGqKz15PGyjDg37Mq4aZXHqzKVoPtarx2Jb4VGS',
    },
  }),
  inputKey: 'message',
});

const result1 = await aigne.invoke(agent, {
  message:
    'My name is John Doe and I like to invest in Bitcoin and my work is doctor is not engineer.',
});
console.log('result1', result1);

const result2 = await aigne.invoke(agent, {
  message: 'What is my favorite cryptocurrency?',
});
console.log('result2', result2);

const result3 = await aigne.invoke(agent, {
  message: 'What is my work?',
});
console.log('result3', result3);
