import { MessageContextMenuInteraction } from 'discord.js';
import { Client } from '.';
import { ContextMenu } from './ContextMenu';

export abstract class MessageContextMenu extends ContextMenu {
  static readonly __type: 'MESSAGE' = 'MESSAGE';

  static async execute(
    client: Client,
    interaction: MessageContextMenuInteraction
  ): Promise<void> {
    interaction.reply({
      ephemeral: true,
      content: `${client.bot.Emojis.error} | This context menu doesn't have an execute function!`,
    });
  }
}
