const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

require('dotenv').config();

// Create a new slash command builder
const commands = [
	new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with pong!'),
	new SlashCommandBuilder()
		.setName('server')
		.setDescription('Replies with server info!'),
	new SlashCommandBuilder()
		.setName('user')
		.setDescription('Replies with user info!'),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest
	.put(
		Routes.applicationGuildCommands(
			process.env.CLIENT_ID,
			process.env.DEV_GUILD,
		),
		{ body: commands },
	)
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

// for guild-based commands
rest
	.delete(
		Routes.applicationGuildCommand(
			process.env.CLIENT_ID,
			process.env.DEV_GUILD,
			'commandId',
		),
	)
	.then(() => console.log('Successfully deleted guild command'))
	.catch(console.error);

// for global commands
rest
	.delete(Routes.applicationCommand(process.env.CLIENT_ID, 'commandId'))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);

// for guild-based commands (all)
rest
	.put(
		Routes.applicationGuildCommands(
			process.env.CLIENT_ID,
			process.env.DEV_GUILD,
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
