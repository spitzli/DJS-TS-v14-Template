import { MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import { Client } from '.';

export abstract class SelectMenu {
  static prefix?: string;
  static id?: string;

  static selectMenu(options?: Record<string, unknown>): MessageSelectMenu {
    return new MessageSelectMenu().setCustomId(
      [...Array(32)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')
    );
  }

  static execute(
    client: Client,
    interaction: SelectMenuInteraction,
    ...args: string[]
  ) {
    interaction.reply({
      ephemeral: true,
      content: `${client.bot.Emojis.error} | This select menu doesn't have an execute function!`,
    });
  }
}
