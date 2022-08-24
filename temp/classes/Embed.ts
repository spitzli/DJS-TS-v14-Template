import { MessageEmbed } from 'discord.js';
import { Bot } from '.';
import { EmbedPreset } from '../types';

export class Embed extends MessageEmbed {
	static PRESETS = EmbedPreset;

	preset(bot: Bot, type: EmbedPreset, text: string): Embed {
		switch (type) {
			case EmbedPreset.DEFAULT:
				this.setColor(bot.Colors.main ?? 'BLURPLE').setDescription(`${text}`);
				break;
			case EmbedPreset.SUCCESS:
				this.setColor(bot.Colors.success ?? 'GREEN').setDescription(
					`${bot.Emojis.success ?? '✅'} | ${text}`,
				);
				break;
			case EmbedPreset.ERROR:
				this.setColor(bot.Colors.error ?? 'RED').setDescription(
					`${bot.Emojis.error ?? '❌'} | ${text}`,
				);
				break;
			case EmbedPreset.LOADING:
				this.setColor(bot.Colors.loading ?? 'YELLOW').setDescription(
					`${bot.Emojis.loading ?? '⏳'} | ${text}`,
				);
				break;
			case EmbedPreset.WARN:
				this.setColor(bot.Colors.warn ?? 'ORANGE').setDescription(
					`${bot.Emojis.warn ?? '⚠️'} | ${text}`,
				);
				break;
			default:
				throw new Error('Invalid Embed Preset');
		}

		return this;
	}
}
