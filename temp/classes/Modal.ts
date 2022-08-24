import { Modal as DModal, ModalSubmitInteraction } from 'discord.js';
import { Client } from '.';

export abstract class Modal {
  static DISCORD = DModal;
  static prefix?: string;
  static id?: string;

  static modal(options?: Record<string, unknown>): DModal {
    return new DModal().setCustomId(
      [...Array(32)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')
    );
  }

  static execute(
    client: Client,
    interaction: ModalSubmitInteraction,
    ...args: string[]
  ) {
    interaction.reply({
      ephemeral: true,
      content: `${client.bot.Emojis.error} | This modal doesn't have an execute function!`,
    });
  }
}
