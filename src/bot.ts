// Require the necessary discord.js classes
import { GatewayIntentBits } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import Client from './classes/Client.js';
import type Command from './types/Command.js';
import type Event from './types/Event.js';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commandsPath = path.join(__dirname, 'commands');

const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath: string = path.join(commandsPath, file);

	const command: Command = (await import(`file://${filePath}`))
		.default as Command;

	console.log(command);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event: Event = (await import(`file://${filePath}`)).default as Event;
	console.log(event.name);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

await client.init(process.env.TOKEN);
