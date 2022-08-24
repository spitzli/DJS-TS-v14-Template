import fs from 'node:fs';
import path from 'node:path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import 'dotenv/config';
import type Command from './types/Command.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	const command: Command = (await import(`file://${filePath}`))
		.default as Command;

	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest
	.put(
		Routes.applicationGuildCommands(
			process.env.CLIENT_ID,
			process.env.DEV_GUILD_ID,
		),
		{
			body: commands,
		},
	)
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
