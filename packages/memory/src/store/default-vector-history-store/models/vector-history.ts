import type { MemoryMetadata } from "@aigne/core";
import {
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import type { ModelStatic, Sequelize } from "sequelize";

export interface VectorHistory
  extends Model<
    InferAttributes<VectorHistory>,
    InferCreationAttributes<VectorHistory>
  > {
  id: string;

  userId?: string;

  sessionId?: string;

  agentId?: string;

  createdAt: string;

  updatedAt: string;

  memory: any;

  metadata: MemoryMetadata;
}

export function initVectorHistoryModel(sequelize: Sequelize) {
  return (
    class VectorHistory extends Model {} as ModelStatic<VectorHistory>
  ).init(
    {
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
      agentId: {
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
    },
    { sequelize, timestamps: false },
  );
}
