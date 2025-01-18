// import { chatCompletions } from '@blocklet/ai-kit/api/call';
// import { ChatCompletionInput, isChatCompletionChunk } from '@blocklet/ai-kit/api/types/chat';

// export default class OpenAIManager {
//   async run<T extends object>(input: ChatCompletionInput): Promise<T> {
//     const stream = await chatCompletions({ model: 'gpt-4o-mini', temperature: 0, ...input });

//     const chunks = [];

//     for await (const chunk of stream) {
//       if (isChatCompletionChunk(chunk)) {
//         chunks.push(chunk.delta.content || '');
//       }
//     }

//     const result = chunks.join('');

//     return {
//       $text: result,
//     } as T;
//   }
// }
