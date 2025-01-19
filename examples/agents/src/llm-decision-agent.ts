import 'core-js'
import 'reflect-metadata'

import {OpenaiLLMModel, LLMDecisionAgent, Runtime, LocalFunctionAgent} from '@aigne/core'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) {
  throw new Error('process.env.OPENAI_API_KEY is required')
}

const context = new Runtime({llmModel: new OpenaiLLMModel({model: 'gpt-4o', apiKey})})

const agent = LLMDecisionAgent.create({
  context,
  modelOptions: {
    model: 'gpt-4o',
    temperature: 0,
  },
  messages: [
    {
      role: 'user',
      content: `\
You are a professional question classifier. Please classify the question and choose the right case to answer it

## User's question
{{question}}`,
    },
  ],
  cases: {
    getName: {
      description: 'get name',
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
          name: {
            type: 'string',
            required: true,
          },
        },
        function: async ({question}) => {
          return {
            $text: `ECHO: ${question}`,
            name: question,
          }
        },
      }),
    },
    getAge: {
      description: 'get age',
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
          age: {
            type: 'number',
            required: true,
          },
        },
        function: async ({question}) => {
          return {
            $text: `ECHO: ${question}`,
            age: question.length,
          }
        },
      }),
    },
  },
})

const result = await agent.run({question: 'my name is tom'})
console.log(result)
