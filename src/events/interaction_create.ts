import { ChannelType, CommandInteraction } from 'discord.js';
import type Command from '../types/Command';
import type Client from '../classes/Client';

export default {
	name: 'interactionCreate',
	async execute(interaction: CommandInteraction) {
		if (
			!interaction.isChatInputCommand() ||
			!interaction.channel ||
			interaction.channel.type === ChannelType.DM
		)
			return;

		console.log(
			`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`,
		);

		const command: Command = (interaction.client as Client).commands.get(
			interaction.commandName,
		) as Command;

		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	},
};
