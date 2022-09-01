import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type Client from '../classes/Client.js';
import type Command from '../types/Command.js';

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('team')
		.setDescription('test')
		.addSubcommand((subcommand) =>
			subcommand

				.setName('create')
				.setDescription('Erstelle ein ein Team')
				.addStringOption((option) =>
					option
						.setName('name')
						.setRequired(true)
						.setDescription('Name des Teams'),
				),
		),
	execute(interaction: CommandInteraction, _client: Client): Promise<0 | 1> {
		return new Promise(async (res) => {
			await interaction.reply('test');
			res(0);
		});
	},
};

export default command;
