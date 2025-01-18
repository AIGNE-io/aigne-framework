// import { mkdir } from 'fs/promises';

// import { FaissLibArgs, FaissStore } from '@langchain/community/vectorstores/faiss';
// import type { EmbeddingsInterface } from '@langchain/core/embeddings';
// import { pathExists } from 'fs-extra';

// import logger from '../logger';

// const vectorStores = new Map<string, Promise<VectorStore>>();

// FaissStore.importFaiss = async () => {
//   try {
//     const {
//       default: { IndexFlatL2 },
//     } = await import('faiss-node');
//     return { IndexFlatL2 };
//   } catch (error) {
//     throw new Error('Please install faiss-node as a dependency with, e.g. `npm install -S faiss-node`');
//   }
// };

// export default class VectorStore extends FaissStore {
//   constructor(
//     private directory: string,
//     embeddings: EmbeddingsInterface,
//     args: FaissLibArgs
//   ) {
//     super(embeddings, args);
//   }

//   static override async load(storePath: string, embeddings: EmbeddingsInterface): Promise<VectorStore> {
//     let store = vectorStores.get(storePath);

//     if (!store) {
//       store = (async () => {
//         let faiss: FaissStore;

//         if (await pathExists(storePath)) {
//           try {
//             faiss = await FaissStore.load(storePath, embeddings);
//           } catch (error) {
//             logger.error('FaissStore load from path error', { error });
//           }
//         } else {
//           await mkdir(storePath, { recursive: true });
//         }
//         faiss ??= await FaissStore.fromDocuments([], embeddings);

//         return new VectorStore(storePath, embeddings, faiss.args);
//       })();

//       vectorStores.set(storePath, store);
//     }

//     return store;
//   }

//   override async save() {
//     await super.save(this.directory);
//   }
// }
