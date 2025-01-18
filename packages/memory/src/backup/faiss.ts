// import { DataTypes } from 'sequelize';

// import { VectorStore, VectorStoreDocument } from '../core/type';
// import { AIKitEmbeddings } from '../lib/embeddings/ai-kit';
// import { addVectors } from '../lib/vector-store';
// import VectorHistory, { init as initContent } from '../store/models/content';
// import { initSequelize } from '../store/sequelize';
// import VectorStoreFaiss from '../store/vector-store-faiss';

// export class ContentManager {
//   static async load(dbPath: string) {
//     const instance = new ContentManager();
//     await instance.init(dbPath);
//     return instance;
//   }

//   private async init(dbPath: string) {
//     const sequelize = initSequelize(dbPath);

//     initContent(sequelize);

//     const tables = await sequelize.getQueryInterface().showAllTables();
//     if (!tables.includes('Contents')) {
//       await sequelize.getQueryInterface().createTable('Contents', {
//         id: {
//           type: DataTypes.STRING,
//           primaryKey: true,
//           allowNull: false,
//         },
//         pageContent: {
//           type: DataTypes.TEXT,
//           allowNull: false,
//         },
//         metadata: {
//           type: DataTypes.JSON,
//           allowNull: false,
//         },
//         createdAt: {
//           type: DataTypes.DATE,
//         },
//         updatedAt: {
//           type: DataTypes.DATE,
//         },
//       });
//     }
//   }

//   async addContent({ id, content, metadata }: { id: string; content: string; metadata: Record<string, any> }) {
//     return await VectorHistory.create({ id, pageContent: content, metadata });
//   }

//   async getContent(id: string) {
//     return await VectorHistory.findOne({ where: { id } });
//   }

//   async listContent(metadata: Record<string, any>, limit?: number) {
//     const where = metadata ? Object.entries(metadata).map(([key, value]) => ({ [`metadata.${key}`]: value })) : {};
//     return await VectorHistory.findAll({ where, limit, order: [['updatedAt', 'DESC']] });
//   }

//   async updateContent(id: string, content: string, metadata: Record<string, any>) {
//     return await VectorHistory.update({ pageContent: content, metadata }, { where: { id } });
//   }
// }

// export default class FaissVectorStoreManager implements VectorStore {
//   private embeddings: AIKitEmbeddings = new AIKitEmbeddings();

//   private vectorStore?: VectorStoreFaiss;

//   private db?: ContentManager;

//   constructor(private vectorsFolderPath: string) {
//     this.init();
//   }

//   async init() {
//     this.vectorStore = await VectorStoreFaiss.load(this.vectorsFolderPath, this.embeddings);
//     this.db = await ContentManager.load(`sqlite:${this.vectorsFolderPath}/content.db`);
//   }

//   async get(id: string) {
//     return (await this.db?.getContent(id)) || null;
//   }

//   async list(metadata: Record<string, any>, limit?: number) {
//     return (await this.db?.listContent(metadata, limit)) || [];
//   }

//   async insert(data: string, id: string, metadata: Record<string, any>) {
//     if (!this.vectorStore) {
//       throw new Error('Vector store not initialized');
//     }

//     await addVectors(this.vectorStore!, data, id, metadata);
//     await this.db?.addContent({ id, content: data, metadata });
//   }

//   async delete(id: string) {
//     if (!this.vectorStore) {
//       throw new Error('Vector store not initialized');
//     }

//     await this.vectorStore.delete({ ids: [id] });
//     await this.vectorStore.save();
//   }

//   async deleteAll() {}

//   async update(id: string, data: string, metadata: Record<string, any>) {
//     if (!this.vectorStore) {
//       throw new Error('Vector store not initialized');
//     }

//     await this.delete(id);
//     await this.insert(data, id, metadata);

//     await this.db?.updateContent(id, data, metadata);
//   }

//   async search(query: string, k: number, metadata?: Record<string, any>): Promise<VectorStoreDocument[]> {
//     if (!this.vectorStore) {
//       throw new Error('Vector store not initialized');
//     }

//     if (metadata) {
//       const results = await this.vectorStore.similaritySearch(
//         query,
//         Math.min(k * 2, Object.keys(this.vectorStore.getMapping()).length),
//         metadata
//       );

//       const filtered = results.filter((doc) => {
//         return Object.entries(metadata).every(([key, value]) => {
//           return doc.metadata[key] === value;
//         });
//       });

//       return filtered;
//     }

//     return await this.vectorStore.similaritySearch(query, k);
//   }

//   async searchWithScore(
//     query: string,
//     k: number,
//     metadata?: Record<string, any>
//   ): Promise<[VectorStoreDocument, number][]> {
//     if (!this.vectorStore) {
//       throw new Error('Vector store not initialized');
//     }

//     if (metadata) {
//       const results = await this.vectorStore.similaritySearchWithScore(
//         query,
//         Math.min(k * 2, Object.keys(this.vectorStore.getMapping()).length),
//         metadata
//       );

//       const filtered = results.filter(([doc]) => {
//         return Object.entries(metadata).every(([key, value]) => {
//           return doc.metadata[key] === value;
//         });
//       });

//       return filtered;
//     }

//     return await this.vectorStore.similaritySearchWithScore(
//       query,
//       Math.min(k, Object.keys(this.vectorStore.getMapping()).length),
//       metadata
//     );
//   }
// }
