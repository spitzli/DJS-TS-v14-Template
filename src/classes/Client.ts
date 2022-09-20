import {
	Client as DJSClient,
	Collection,
	ClientOptions,
	ClientEvents,
} from 'discord.js';
import type Command from '../types/Command.js';
import { logger } from '../utils/logger.js';
import fs from 'node:fs';
import path from 'node:path';
import type Event from '../types/Event.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';
import { performance } from 'node:perf_hooks';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Client extends DJSClient {
	readonly commands: Collection<string, Command> = new Collection();
	startTime = performance.now();

	// Utils
	log;

	async init(token: string): Promise<void> {
		await this.login(token);

		if (!this.user?.id) throw new Error('Client is not defined');

		this.log = logger({
			name: `BOT - ${this.user.tag}`,
			logLevel: process.env.LOG_LEVEL
				? logLevels[process.env.LOG_LEVEL]
				: process.env.NODE_ENV === ('debug' || 'development')
				? 0
				: 1,
		});

		let start = performance.now();

		this.log.info(`Loading ${chalk.yellow('commands')}...`);

		const commandsPath = path.join(__dirname, '..', 'commands');

		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath: string = path.join(commandsPath, file);
			const start = Date.now();
			const command: Command = (await import(`file://${filePath}`))
				.default as Command;

			this.log.debug(`Loading command ${command.options.name}...`);
			this.log.debug(
				`Loaded command ${command.options.name} - took ${Date.now() - start}ms`,
			);
		this.log.info(
			`Loaded ${
				this.commands.size +
				' ' +
				chalk.yellow('command' + (this.commands.size == 1 ? '' : 's'))
			} - took ${chalk.green(Math.floor(performance.now() - start) + 'ms')}`,
		);

			this.commands.set(command.data.name, command);
		// Check if commands changed

		let file = '[]';

		if (!fs.existsSync(path.join(__dirname, '..', 'command_insances.json'))) {
			file = fs
				.readFileSync(path.join(__dirname, '..', 'command_instances.json'))
				.toString();
		}

		try {
			JSON.parse(file);
		} catch {
			file = '[]';
		}

		const savedCommandInstances: Command['options'][] = JSON.parse(file);
		const currentCommandInstances = JSON.parse(
			JSON.stringify(this.commands.map((c) => c.options)),
		);

		// Redeploy commands if they changed
		if (
			JSON.stringify(savedCommandInstances) !==
			JSON.stringify(currentCommandInstances)
		) {
			let start = performance.now();
			this.log.info('Redeploying commands because of changes');
			const commandManager =
				process.env.COMMAND_MODE == 'DEV_SERVER' && process.env.DEV_GUILD_ID
					? this.guilds.cache.get(process.env.DEV_GUILD_ID)!.commands
					: this.application!.commands;

			await commandManager.set(this.commands.map((c) => c.options));

			fs.writeFileSync(
				path.join(__dirname, '..', 'command_instances.json'),
				JSON.stringify(this.commands.map((c) => c.options.toJSON())),
			);

			this.log.info(
				`Redeployed ${this.commands.size} commands - took ${chalk.green(
					Math.floor(performance.now() - start) + 'ms',
				)}`,
			);
		}

		if (
			JSON.stringify(savedCommandInstances) ===
			JSON.stringify(currentCommandInstances)
		)
			this.log.info('Commands up to date');

		// Load events
		this.log.info(`Loading ${chalk.blue('events')}`);
		start = performance.now();

		const eventsPath = path.join(__dirname, '..', 'events');
		const eventFiles = fs
			.readdirSync(eventsPath)
			.filter((file) => file.endsWith('.js'));

		// Create Map for events
		const events = new Collection<
			'once' | 'on',
			Collection<keyof ClientEvents, Event[]>
		>([
			['on', new Collection<keyof ClientEvents, Event[]>()],
			['once', new Collection<keyof ClientEvents, Event[]>()],
		]);

		// Loop through event files and load them into the event map
		for (const file of eventFiles) {
			const filePath = path.join(eventsPath, file);
			const start = performance.now();
			const event: Event = (await import(`file://${filePath}`))
				.default as Event;

			if (event.once) {
				this.log.debug(`Loading once event ${event.name}...`);
				const onceMap = events.get('once')!;
				let eventMap =
					onceMap.get(event.name) ??
					onceMap.set(event.name, []).get(event.name)!;

				eventMap.push(event);
				this.log.debug(
					`Loaded once event ${event.name} - took ${Math.floor(
						performance.now() - start,
					)}ms`,
				);
			}

			if (!event.once) {
				this.log.debug(`Loading event ${event.name}...`);
				const onMap = events.get('once')!;
				let eventMap =
					onMap.get(event.name) ?? onMap.set(event.name, []).get(event.name)!;

				eventMap.push(event);
				this.log.debug(
					`Loaded event ${event.name} - took ${Math.floor(
						performance.now() - start,
					)}ms`,
				);
			}
		}

		// Create listeners for the events
		for (const [key, eventMap] of events.entries()) {
			if (key == 'once') {
				this.log.debug(`Register once events...`);
				for (const [key, events] of eventMap.entries()) {
					this.once(key, (...args) => {
						events.forEach((event) => {
							event.execute(this, ...args);
						});
					});
				}
			}

			if (key != 'once') {
				this.log.debug(`Register events...`);
				for (const [key, events] of eventMap.entries()) {
					this.once(key, (...args) => {
						events.forEach((event) => {
							event.execute(this, ...args);
						});
					});
				}
			}
		}

		this.log.info(
			`Loaded ${eventAmount + ' ' + chalk.blue('events')} - took ${chalk.green(
				Math.floor(performance.now() - start) + 'ms',
			)}`,
		);

		this.log.info(
			`Successfully started the ${chalk.hex('8f00ff')(
				'client',
			)} - took ${chalk.green(
				Math.floor(performance.now() - this.startTime) + 'ms',
			)}`,
		);
	}

	// Login
	constructor(clientSettings: ClientOptions) {
		super(clientSettings);
		this.log = logger();
	}
}

// OWO
const logLevels = {
	DEBUG: 0,
	INFO: 1,
	WARN: 2,
	ERROR: 3,
	FATAL: 4,
};
