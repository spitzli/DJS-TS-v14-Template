import { Client as DJSClient, Collection, ClientOptions } from 'discord.js';
import type Command from '../types/Command.js';
import { logger, LogLevels } from '../utils/logger.js';
import chalk from 'chalk';

export default class Client extends DJSClient {
	readonly commands: Collection<string, Command> = new Collection();

	// Utils
	log;

	async init(token: string): Promise<void> {
		await this.login(token);

		if (!this.user?.id) throw new Error('Client is not defined');

		this.log = logger({
			name: `${chalk.cyan('BOT-')}${chalk.cyanBright(this.user.id)}`,
			logLevel: process.env.LOG_LEVEL
				? LogLevels[process.env.LOG_LEVEL as keyof typeof LogLevels]
				: process.env.NODE_ENV === ('debug' || 'development')
				? 0
				: 1,
		});
	}

	constructor(clientSettings: ClientOptions) {
		super(clientSettings);
		this.log = logger();
	}
}

// OWO
