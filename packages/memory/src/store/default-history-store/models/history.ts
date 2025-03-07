import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import type { ModelStatic, Sequelize } from "sequelize";

import type { EventType } from "../../../core/type";
import nextId from "../../../lib/next-id";

export interface History extends Model<InferAttributes<History>, InferCreationAttributes<History>> {
  id: CreationOptional<string>;

  memoryId: string;

  oldMemory?: any;

  newMemory?: any;

  event: EventType;

  createdAt: CreationOptional<Date>;

  updatedAt: CreationOptional<Date>;

  isDeleted?: boolean;
}

export function initHistoryModel(sequelize: Sequelize) {
  return (class History extends Model {} as ModelStatic<History>).init(
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
    },
    { sequelize },
  );
}
