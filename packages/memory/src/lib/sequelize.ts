import "sqlite3";

import { Sequelize } from "sequelize";

import { logger } from "@aigne/core";

export function initSequelize(path: string) {
	const sequelize = new Sequelize(path, {
		logging: (sql) => logger.debug(sql),
	});

	sequelize.query("pragma journal_mode = WAL;");
	sequelize.query("pragma synchronous = normal;");
	sequelize.query("pragma journal_size_limit = 67108864;");

	return sequelize;
}
