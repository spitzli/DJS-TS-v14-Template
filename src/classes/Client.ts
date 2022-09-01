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
import { performance } from 'perf_hooks';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Client extends DJSClient {
	readonly commands: Collection<string, Command> = new Collection();

	// Utils
	log;

	startTime = performance.now();

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

		const commandsPath = path.join(__dirname, '..', 'commands');

		let start = performance.now();
		this.log.info(`Loading ${chalk.yellow('commands')}...`);
		// TODO register commands, not just load them
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith('.js'));

		for (const file of commandFiles) {
			const start = performance.now();
			const filePath: string = path.join(commandsPath, file);
			const command: Command = (await import(`file://${filePath}`))
				.default as Command;

			this.commands.set(command.data.name, command);
			this.log.debug(
				`Loaded command ${command.data.name} - took ${chalk.blue(
					`${Math.floor(performance.now() - start)}ms`,
				)}`,
			);
		}

		this.log.info(
			`Finisched loading ${chalk.yellow(
				this.commands.size + ' command',
				this.commands.size == 1 ? '' : 's',
			)} - took ${chalk.blue(`${Math.floor(performance.now() - start)}ms`)}`,
		);

		start = performance.now();
		this.log.info(`Loading ${chalk.yellow('events')}...`);

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
			const event: Event = (await import(`file://${filePath}`))
				.default as Event;

			if (event.once) {
				const onceMap = events.get('once')!;
				let eventMap =
					onceMap.get(event.name) ??
					onceMap.set(event.name, []).get(event.name)!;

				eventMap.push(event);
			}

			if (!event.once) {
				const onMap = events.get('once')!;
				let eventMap =
					onMap.get(event.name) ?? onMap.set(event.name, []).get(event.name)!;

				eventMap.push(event);
			}
		}

		// Create listeners for the events
		for (const [key, eventMap] of events.entries()) {
			if (key == 'once') {
				for (const [key, events] of eventMap.entries()) {
					this.log.debug(`Loading ${key} events(once)`);
					this.once(key, (...args) => {
						events.forEach((event) => {
							event.execute(this, ...args);
						});
					});
				}
			}

			if (key != 'once') {
				for (const [key, events] of eventMap.entries()) {
					this.once(key, (...args) => {
						this.log.debug(`Loading ${key} events (on)`);
						events.forEach((event) => {
							event.execute(this, ...args);
						});
					});
				}
			}
		}

		let eventAmout = 0;
		events.forEach((events) => {
			events.forEach((events) => {
				eventAmout += events.length;
			});
		});

		this.log.info(
			`Finisched loading ${chalk.yellow(
				eventAmout + ' event' + (eventAmout == 1 ? '' : 's'),
			)} - took ${chalk.blue(`${Math.floor(performance.now() - start)}ms`)}`,
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
