import { Routes } from 'discord.js';
import { REST } from '@discordjs/rest';

import 'dotenv/config';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// for guild-based commands (all)
rest
	.put(
		Routes.applicationGuildCommands(
			process.env.CLIENT_ID,
			process.env.DEV_GUILD_ID,
		),
		{ body: [] },
	)
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);

// for global commands (all)
rest
	.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
