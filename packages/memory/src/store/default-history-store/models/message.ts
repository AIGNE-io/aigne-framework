import type { MemoryMessage, MemoryMetadata } from "@aigne/core";
import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import type { ModelStatic, Sequelize } from "sequelize";

import nextId from "../../../lib/next-id";

export interface Message
  extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  id: CreationOptional<string>;

  createdAt: CreationOptional<Date>;

  updatedAt: CreationOptional<Date>;

  userId?: string;

  sessionId?: string;

  agentId?: string;

  messages: MemoryMessage[];

  metadata: MemoryMetadata;
}

export function initMessageModel(sequelize: Sequelize) {
  return (class Message extends Model {} as ModelStatic<Message>).init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        defaultValue: nextId,
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
      agentId: {
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
    },
    { sequelize },
  );
}
