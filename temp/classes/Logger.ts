import { Bot, Event } from '.';
import chalk from 'chalk';

export class Logger {
  readonly bot: Bot;
  
  constructor(bot: Bot) {
    this.bot = bot;
  }

  log(message: string): Logger {
    console.log(
      `${chalk.grey('[')}${Logger.formatDate(new Date())}${chalk.grey(
        ']'
      )} ${chalk.cyan('BOT-')}${chalk.cyanBright(this.bot.id)} ${chalk.grey(
        '|'
      )} ${message}`
    );

    return this;
  }

  warn(message: string): Logger {
    this.log(Logger.formatText('WARN', chalk.yellowBright, message));

    return this;
  }

  error(message: string): Logger {
    this.log(Logger.formatText('ERROR', chalk.redBright, message));

    return this;
  }

  info(message: string): Logger {
    this.log(Logger.formatText('INFO', chalk.blueBright, message));

    return this;
  }

  success(message: string): Logger {
    this.log(Logger.formatText('SUCCESS', chalk.greenBright, message));

    return this;
  }

  critical(message: string): Logger {
    this.log(Logger.formatText('CRITICAL', chalk.red, message));

    return this;
  }

  debug(message: string): Logger {
    if (this.bot.Config.debug)
      this.log(Logger.formatText('DEBUG', chalk.yellowBright, message));

    return this;
  }

  event(event: typeof Event, message: string): Logger {
    this.log(Logger.formatText(event.name, chalk.magentaBright, message));

    return this;
  }

  static formatText(type: string, color: chalk.Chalk, message: string): string {
    return `${color(type.toUpperCase())} ${chalk.green('>>')} ${chalk.white(
      message
    )}`;
  }

  static formatDate(date: Date): string {
    return `${chalk.greenBright(
      (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1)
    )}${chalk.green('/')}${chalk.greenBright(
      (date.getDate() < 10 ? '0' : '') + date.getDate()
    )}${chalk.green('/')}${chalk.greenBright(date.getFullYear())}`;
  }
}
