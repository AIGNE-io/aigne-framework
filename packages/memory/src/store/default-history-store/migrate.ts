import type { Sequelize } from "sequelize";
import { SequelizeStorage, Umzug } from "umzug";

import * as init from "./migrations/20241224202701-init";
import * as addAgentIdForMessage from "./migrations/20250123220101-add-agent-id-for-message";

export const migrate = async (sequelize: Sequelize) => {
  const umzug = new Umzug({
    migrations: [
      { ...init, name: "20241224202701-init" },
      {
        ...addAgentIdForMessage,
        name: "20250123220101-add-agent-id-for-message",
      },
    ],
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  await umzug.up();
};
