import { DataTypes, type QueryInterface } from "sequelize";

export const up = async ({ context: queryInterface }: { context: QueryInterface }) => {
  await queryInterface.renameTable("VectorHistories", "VectorHistoryBack");

  await queryInterface.createTable("VectorHistories", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
    },
    sessionId: {
      type: DataTypes.STRING,
    },
    createdAt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    memory: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });

  await queryInterface.sequelize.query(`
    INSERT INTO "VectorHistories" (id, "userId", "sessionId", "createdAt", "updatedAt", memory, metadata)
    SELECT data ->> 'id', data ->> 'userId', data ->> 'sessionId', data ->> 'createdAt', data ->> 'updatedAt', data -> 'memory', data -> 'metadata'
    FROM "VectorHistoryBack"
  `);
};

export const down = async ({ context: queryInterface }: { context: QueryInterface }) => {
  await queryInterface.dropTable("VectorHistories");

  await queryInterface.renameTable("VectorHistoryBack", "VectorHistories");
};
