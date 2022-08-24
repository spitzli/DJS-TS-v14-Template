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

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Client extends DJSClient {
	readonly commands: Collection<string, Command> = new Collection();

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

		const commandsPath = path.join(__dirname, '..', 'commands');

		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath: string = path.join(commandsPath, file);
			const start = Date.now();
			const command: Command = (await import(`file://${filePath}`))
				.default as Command;

			this.log.info(`Loading command ${command.data.name}...`);

			this.commands.set(command.data.name, command);

			this.log.info(
				`Loaded command ${command.data.name}! in ${Date.now() - start}ms`,
			);
		}

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
			const start = Date.now();
			const event: Event = (await import(`file://${filePath}`))
				.default as Event;

			if (event.once) {
				this.log.info(`Loading once event ${event.name}...`);
				const onceMap = events.get('once')!;
				let eventMap =
					onceMap.get(event.name) ??
					onceMap.set(event.name, []).get(event.name)!;

				eventMap.push(event);
				this.log.info(
					`loaded once event ${event.name}! in ${Date.now() - start}ms`,
				);
			}

			if (!event.once) {
				this.log.info(`Loading event ${event.name}...`);
				const onMap = events.get('once')!;
				let eventMap =
					onMap.get(event.name) ?? onMap.set(event.name, []).get(event.name)!;

				eventMap.push(event);
				this.log.info(`loaded event ${event.name}! in ${Date.now() - start}ms`);
			}
		}

		// Create listeners for the events
		for (const [key, eventMap] of events.entries()) {
			if (key == 'once') {
				this.log.info(`Register once events...`);
				for (const [key, events] of eventMap.entries()) {
					this.once(key, (...args) => {
						events.forEach((event) => {
							event.execute(this, ...args);
						});
					});
				}
			}

			if (key != 'once') {
				this.log.info(`Register events...`);
				for (const [key, events] of eventMap.entries()) {
					this.once(key, (...args) => {
						events.forEach((event) => {
							event.execute(this, ...args);
						});
					});
				}
			}
		}
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
