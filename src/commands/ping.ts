import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type Command from '../types/Command.js';

export const command: Command = {
	options: new SlashCommandBuilder().setName('ping').setDescription('pong'),
	execute(interaction: CommandInteraction): Promise<0 | 1> {
		return new Promise(async (res) => {
			await interaction.reply("OWO I'm pong!");
			res(0);
		});
	},
};

export default command;
