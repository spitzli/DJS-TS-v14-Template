import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import type Client from '../classes/Client.js';
import type Command from '../types/Command.js';

export const command: Command = {
	data: new SlashCommandBuilder().setName('ping').setDescription('pong'),
	execute(interaction: CommandInteraction, client: Client): Promise<0 | 1> {
		return new Promise(async (res) => {
			await interaction.reply(
				`🏓Latency is ${
					Date.now() - interaction.createdTimestamp
				}ms. API Latency is ${Math.round(client.ws.ping)}ms`,
			);
			res(0);
		});
	},
};

export default command;
