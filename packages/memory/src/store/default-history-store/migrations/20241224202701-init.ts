import { DataTypes, type QueryInterface } from "sequelize";

export const up = async ({
  context: queryInterface,
}: { context: QueryInterface }) => {
  await queryInterface.createTable("Histories", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    memoryId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    oldMemory: {
      type: DataTypes.JSON,
    },
    newMemory: {
      type: DataTypes.JSON,
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
    },
  });

  await queryInterface.createTable("Messages", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
    },
    sessionId: {
      type: DataTypes.STRING,
    },
    messages: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  });
};

export const down = async ({
  context: queryInterface,
}: { context: QueryInterface }) => {
  await queryInterface.dropTable("Histories");
  await queryInterface.dropTable("Messages");
};
