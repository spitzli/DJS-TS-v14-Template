import { createPool, Pool } from 'mysql';
import { Database } from '.';
import { DatabaseType, SqlDatabaseOptions } from '../types';

export class SqlDatabase extends Database {
	private readonly pool: Pool;

	constructor(options: SqlDatabaseOptions) {
		super({ type: DatabaseType.SQL });

		const {
			database,
			host,
			password,
			user,
			connectionLimit,
			acquireTimeout,
			queueLimit,
			waitForConnections,
		} = options;

		this.pool = createPool({
			connectionLimit: connectionLimit || 10,
			acquireTimeout: acquireTimeout || 10000,
			queueLimit: queueLimit || 0,
			waitForConnections: waitForConnections || true,
			host: host,
			user: user,
			password: password,
			database: database,
		});
	}

	query(query: string): Promise<Record<'error' | 'results' | 'fields', any>> {
		return new Promise((resolve) => {
			this.pool.query(
				query,
				(
					error: any | undefined,
					results: any | undefined,
					fields: any | undefined,
				) => {
					resolve({ error, results, fields });
				},
			);
		});
	}
}
