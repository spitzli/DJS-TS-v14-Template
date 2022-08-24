import { Bot, Database } from '.';
import { DatabaseType, JsonDatabaseOptions } from '../types';
import * as path from 'path';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import chalk from 'chalk';

export class JsonDatabase extends Database {
	readonly path: string;
	public cache: Record<string, any> = {};

	constructor(options: JsonDatabaseOptions) {
		super({ type: DatabaseType.JSON });

		const { dirPath } = options;

		this.path = path.join(process.cwd(), dirPath);

		this.read();
	}

	log(bot: Bot): void {
		bot.logger.debug(
			`Using ${chalk.magentaBright(this.path)} as DatabasePath!`,
		);
		bot.logger.debug(
			`Loaded ${chalk.yellowBright(Object.keys(this.cache).length)} File${
				Object.keys(this.cache).length === 1 ? '' : 's'
			}.`,
		);
	}
	write(): boolean {
		for (let [dataPath, data] of Object.entries(this.cache)) {
			const filePath = path.join(this.path, `${dataPath}.json`);
			writeFileSync(filePath, JSON.stringify(data, null, 3));
		}
		readdirSync(this.path)
			.filter((f) => f.endsWith('.json'))
			.filter((f) => !this.cache[f.split('.')[0] as string])
			.forEach((file: string) => {
				const filePath = path.join(this.path, file);
				rmSync(filePath);
			});

		return true;
	}

	read(): boolean {
		this.cache = {};
		readdirSync(this.path)
			.filter((f) => f.endsWith('.json'))
			.forEach((file: string) => {
				const filePath = path.join(this.path, file);
				const data = JSON.parse(
					readFileSync(filePath, 'utf-8').toString() || '{}',
				);
				this.cache[file.split('.')[0] as string] = data;
			});
		return true;
	}
}
