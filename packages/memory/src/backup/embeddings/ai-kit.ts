// import { embeddings } from '@blocklet/ai-kit/api/call';
// import { EmbeddingInput } from '@blocklet/ai-kit/api/types/embedding';
// import { Embeddings, EmbeddingsParams } from '@langchain/core/embeddings';

// import { chunkArray } from './chunk';

// export interface AIKitEmbeddingsParams extends EmbeddingsParams {
//   /** Model name to use */
//   modelName: string;

//   /**
//    * Timeout to use when making requests to OpenAI.
//    */
//   timeout?: number;

//   /**
//    * The maximum number of documents to embed in a single request. This is
//    * limited by the OpenAI API to a maximum of 2048.
//    */
//   batchSize?: number;

//   /**
//    * Whether to strip new lines from the input text. This is recommended by
//    * OpenAI, but may not be suitable for all use cases.
//    */
//   stripNewLines?: boolean;
// }

// export class AIKitEmbeddings extends Embeddings implements AIKitEmbeddingsParams {
//   modelName = 'text-embedding-ada-002';

//   batchSize = 512;

//   stripNewLines = true;

//   timeout?: number;

//   azureOpenAIApiVersion?: string;

//   azureOpenAIApiKey?: string;

//   azureOpenAIApiInstanceName?: string;

//   azureOpenAIApiDeploymentName?: string;

//   constructor(
//     fields?: Partial<AIKitEmbeddingsParams> & {
//       verbose?: boolean;
//     }
//   ) {
//     super(fields ?? {});

//     this.modelName = fields?.modelName ?? this.modelName;
//     this.batchSize = fields?.batchSize ?? this.batchSize;
//     this.stripNewLines = fields?.stripNewLines ?? this.stripNewLines;
//     this.timeout = fields?.timeout;
//   }

//   override async embedDocuments(texts: string[]): Promise<number[][]> {
//     const subPrompts = chunkArray(
//       this.stripNewLines ? texts.map((t) => t.replaceAll('\n', ' ')) : texts,
//       this.batchSize
//     );

//     const embeddings: number[][] = [];

//     for (let i = 0; i < subPrompts.length; i += 1) {
//       const input = subPrompts[i]!;

//       const { data } = await this.embeddingWithRetry({ model: this.modelName, input });

//       for (let j = 0; j < input.length; j += 1) {
//         embeddings.push(data[j]!.embedding);
//       }
//     }

//     return embeddings;
//   }

//   async embedQuery(text: string): Promise<number[]> {
//     const { data } = await this.embeddingWithRetry({
//       model: this.modelName,
//       input: this.stripNewLines ? text.replaceAll('\n', ' ') : text,
//     });
//     return data[0]!.embedding;
//   }

//   private async embeddingWithRetry(request: EmbeddingInput) {
//     return embeddings(request);
//   }
// }
