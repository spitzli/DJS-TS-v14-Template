import {
	ApplicationCommandData,
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	CommandInteraction,
} from 'discord.js';
import { Bot, Client } from '.';
import { CommandOptions } from '../types';

export abstract class Command {
	static description?: string;
	static guild?: string[] | string;
	static options?: CommandOptions[];
	static defaultPermissions?: boolean;

	static getGuilds(): string[] {
		return this.guild
			? Array.isArray(this.guild)
				? this.guild
				: [this.guild]
			: [];
	}

	static data(): ApplicationCommandData {
		return {
			name: this.name.toLowerCase(),
			description: this.description || 'No description provided.',
			type: 'CHAT_INPUT',
			options: this.options ?? [],
			defaultPermission: this.defaultPermissions ?? true,
		};
	}
	static async execute(
		client: Client,
		interaction: CommandInteraction,
	): Promise<void> {
		interaction.reply({
			ephemeral: true,
			content: `${client.bot.Emojis.error} | This command doesn't have an execute function!`,
		});
	}

	static async autocomplete(
		client: Client,
		interaction: AutocompleteInteraction,
		option: string,
		value: string | number | ApplicationCommandOptionType,
	): Promise<void> {
		interaction.respond([]);
		return;
	}
}
