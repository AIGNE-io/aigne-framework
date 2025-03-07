import { DataTypes, type QueryInterface } from "sequelize";

export const up = async ({ context: queryInterface }: { context: QueryInterface }) => {
  await queryInterface.addColumn("VectorHistories", "agentId", {
    type: DataTypes.STRING,
  });
};

export const down = async ({ context: queryInterface }: { context: QueryInterface }) => {
  await queryInterface.removeColumn("VectorHistories", "agentId");
};
