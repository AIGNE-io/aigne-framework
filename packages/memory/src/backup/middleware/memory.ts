// /* eslint-disable no-console */
// import compression from 'compression';
// import { Router } from 'express';
// import Joi from 'joi';

// import { DefaultMemory, ShortTermRunnable } from '../core';
// import OpenAIManager from '../llm/openai';

// const messageSchema = Joi.object({
//   role: Joi.string().required(),
//   content: Joi.string().required(),
// });

// const optionsSchema = Joi.object({
//   userId: Joi.string().optional(),
//   sessionId: Joi.string().optional(),
//   metadata: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
//   filters: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
// });

// const requestSchema = Joi.object({
//   messages: Joi.array().items(messageSchema).required(),
//   options: optionsSchema.optional(),
// });

// const searchOptionsSchema = Joi.object({
//   k: Joi.number().integer().min(1).optional(),
//   userId: Joi.string().optional(),
//   sessionId: Joi.string().optional(),
//   filters: Joi.object().pattern(Joi.string(), Joi.any()).optional(),
// });

// const searchRequestSchema = Joi.object({
//   query: Joi.string().required(),
//   options: searchOptionsSchema.optional(),
// });

// export function memoryRoutes(router: Router, path: string) {
//   // TODO: pass llmModel to Memory
//   const loadMemory = DefaultMemory.load({ path, runner: new ShortTermRunnable(undefined as any) });

//   router.post('/add', compression(), async (req, res) => {
//     const memory = await loadMemory;

//     const { messages, options } = await requestSchema.validateAsync(req.body, { stripUnknown: true });
//     const result = await memory.add(messages, options);
//     res.json(result);
//   });

//   router.post('/search', compression(), async (req, res) => {
//     const memory = await loadMemory;

//     const { query, options } = await searchRequestSchema.validateAsync(req.body, { stripUnknown: true });
//     const result = await memory.search(query, options);
//     res.json(result);
//   });

//   router.post('/run', compression(), async (req, res) => {
//     const { messages, options } = await requestSchema.validateAsync(req.body, { stripUnknown: true });
//     const memory = await loadMemory;
//     const llm = new OpenAIManager();
//     const memories = await memory.search(JSON.stringify(messages), options);
//     console.log('memories', JSON.stringify(memories.results, null, 2));

//     const assistantMessage = await llm.run({
//       model: 'gpt-4o',
//       messages: [
//         memories.results.length
//           ? { role: 'system', content: `this is the memories: ${JSON.stringify(memories, null, 2)}` }
//           : null,
//         ...messages,
//       ].filter(Boolean),
//       temperature: 0,
//     });
//     console.log('assistantMessage', assistantMessage);
//     const result = await memory.add([...messages, { role: 'assistant', content: assistantMessage }], options);
//     console.log('result', JSON.stringify(result, null, 2));
//     res.json(assistantMessage);

//     // const response = await llm.chat.completions.create({
//     //   model: 'gpt-4o',
//     //   messages: [
//     //     {
//     //       role: 'system',
//     //       content: `你是一个时间计算助手, 当前时间: ${new Date().toISOString()}， 请根据当前时间推断出用户所需要具体时间， 时间格式为 YYYY-MM-DD HH:mm:ss`,
//     //     },
//     //     ...messages,
//     //   ].filter(Boolean),
//     //   temperature: 0,
//     //   response_format: {
//     //     type: 'json_schema',
//     //     json_schema: {
//     //       name: 'data_schema',
//     //       schema: {
//     //         type: 'object',
//     //         properties: {
//     //           date: {
//     //             type: 'string',
//     //             description: 'The time string',
//     //             format: 'YYYY-MM-DD HH:mm:ss',
//     //           },
//     //         },
//     //         required: ['date'],
//     //         additionalProperties: false,
//     //       },
//     //     },
//     //   },
//     // });
//     // console.log('response', response);
//     // res.json(response);
//   });

//   return router;
// }
