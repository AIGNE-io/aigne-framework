import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from "sequelize";
import type { ModelStatic, Sequelize } from "sequelize";
import { v7 } from "uuid";

const nextId = () => v7();

export interface Memory extends Model<InferAttributes<Memory>, InferCreationAttributes<Memory>> {
  id: CreationOptional<string>;

  createdAt: CreationOptional<Date>;

  updatedAt: CreationOptional<Date>;

  sessionId?: string | null;

  content: unknown;
}

export function initMemoryModel(sequelize: Sequelize) {
  return (class Memory extends Model {} as ModelStatic<Memory>).init(
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
      sessionId: {
        type: DataTypes.STRING,
      },
      content: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    { sequelize },
  );
}
