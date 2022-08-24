import chalk from 'chalk';
import { ClientEvents } from 'discord.js';
import { schedule } from 'node-cron';
import { EventType } from '../types';
import { Bot } from '.';

export abstract class Event {
	static TYPES = EventType;

	static type: EventType;
	static emitter?: keyof ClientEvents | string;
	static timeout?: number;
	static interval?: number;
	static cronExpression?: string;
	static register(bot: Bot): Promise<boolean> {
		return new Promise(async (resolve) => {
			try {
				switch (this.type) {
					default:
						bot.logger.error(
							`Invalid event type "${chalk.redBright(
								EventType[this.type] ?? this.type,
							)}" for ${chalk.magentaBright(this.name)}.`,
						);
						break;
					case EventType.PROCESS:
						if (this?.emitter)
							process.on(this.emitter, (...args) => {
								bot.logger.debug(
									`Process triggered the event "${chalk.yellowBright(
										this.name,
									)}".`,
								);
								try {
									this.execute(bot, ...args);
								} catch (e: Error | any) {
									bot.logger.error(
										`Unable to execute ${chalk.redBright(this.name)}! Error: ${
											e.message
										}`,
									);
								}
							});
						break;
					case EventType.DISCORD:
						if (this?.emitter)
							bot.client.on(this.emitter, (...args) => {
								bot.logger.debug(
									`Client triggered the event "${chalk.yellowBright(
										this.name,
									)}".`,
								);
								try {
									this.execute(bot, ...args);
								} catch (e: Error | any) {
									bot.logger.error(
										`Unable to execute ${chalk.redBright(this.name)}! Error: ${
											e.message
										}`,
									);
								}
							});
						break;
					case EventType.INTERVAL:
						if (this.interval)
							setInterval(() => {
								bot.logger.debug(
									`Interval triggered the event "${chalk.yellowBright(
										this.name,
									)}".`,
								);
								try {
									this.execute(bot);
								} catch (e: Error | any) {
									bot.logger.error(
										`Unable to execute ${chalk.redBright(this.name)}! Error: ${
											e.message
										}`,
									);
								}
							}, this.interval);
						break;
					case EventType.TIMEOUT:
						if (this.timeout)
							setTimeout(() => {
								bot.logger.debug(
									`Timeout triggered the event "${chalk.yellowBright(
										this.name,
									)}".`,
								);
								try {
									this.execute(bot);
								} catch (e: Error | any) {
									bot.logger.error(
										`Unable to execute ${chalk.redBright(this.name)}! Error: ${
											e.message
										}`,
									);
								}
							}, this.timeout);
						break;
					case EventType.CRON:
						if (this.cronExpression)
							schedule(this.cronExpression, () => {
								bot.logger.debug(
									`Cron triggered the event "${chalk.yellowBright(
										this.name,
									)}".`,
								);
								try {
									this.execute(bot);
								} catch (e: Error | any) {
									bot.logger.error(
										`Unable to execute ${chalk.redBright(this.name)}! Error: ${
											e.message
										}`,
									);
								}
							});
						break;
				}
				return resolve(true);
			} catch (e) {
				return resolve(false);
			}
		});
	}

	static getType(): string | undefined {
		return EventType[this.type];
	}

	static async execute(bot: Bot, ...args: any[]): Promise<void> {
		bot.logger.event(
			this,
			`Event not implemented! Recived ${chalk.yellowBright(
				args.length,
			)} argument${args.length === 1 ? '' : 's'}.`,
		);
	}
}
