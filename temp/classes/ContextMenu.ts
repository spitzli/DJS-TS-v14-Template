import {
	ApplicationCommandData,
	ContextMenuInteraction,
	MessageContextMenuInteraction,
	UserContextMenuInteraction,
} from 'discord.js';
import { Client } from '.';
import { CommandOptions } from '../types';

export abstract class ContextMenu {
	static readonly __type: 'MESSAGE' | 'USER';
	static menuName: string;
	static description?: string;
	static guild?: string[] | string;
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
			name: this.menuName,
			type: this.__type,
			defaultPermission: this.defaultPermissions ?? true,
		};
	}

	static async execute(
		client: Client,
		interaction: MessageContextMenuInteraction | UserContextMenuInteraction,
	): Promise<void> {
		interaction.reply({
			ephemeral: true,
			content: `${client.bot.Emojis.error} | This context menu doesn't have an execute function!`,
		});
	}

	static getType(
		interaction: ContextMenuInteraction,
	): 'MESSAGE' | 'USER' | null {
		if (interaction.isMessageContextMenu()) return 'MESSAGE';
		if (interaction.isUserContextMenu()) return 'USER';

		return null;
	}
}
