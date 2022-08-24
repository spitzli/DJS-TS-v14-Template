import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type Command from '../types/Command';

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!')
		.addStringOption((option) =>
			option
				.setName('message')
				.setDescription('The message to send')
				.setRequired(false),
		),
	async execute(interaction: CommandInteraction) {
		await interaction.reply('Pong!');
	},
};

export default command;
