import { Bot } from '.';
import { createHash } from 'crypto';

export class Utils {
  private readonly bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  hash(text: string): string {
    return createHash('sha256').update(Buffer.from(text)).digest('hex');
  }

  generateHexString(length: number): string {
    return [...Array(length)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }
}
