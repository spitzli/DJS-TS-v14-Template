import { DatabaseOptions, DatabaseType } from '../types';
import { JsonDatabase } from './JsonDatabase';
import { SqlDatabase } from './SqlDatabase';

export class Database {
	readonly type: DatabaseType;

	constructor(options: DatabaseOptions) {
		const { type } = options;

		this.type = type;
	}

	isJsonDatabase(): this is JsonDatabase {
		return this.type === DatabaseType.JSON;
	}

	isSqlDatabase(): this is SqlDatabase {
		return this.type === DatabaseType.SQL;
	}
}
