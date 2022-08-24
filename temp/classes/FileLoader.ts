import { EventType, FileLoaderType, LoadingStats } from '../types';
import { Bot, Command, Event, Button, SelectMenu } from '.';
import { existsSync, readdirSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Collection } from 'discord.js';
import { ContextMenu } from './ContextMenu';

export class FileLoader {
	static TYPES = FileLoaderType;

	bot: Bot;
	type: FileLoaderType;
	filePath: string;

	constructor(bot: Bot, type: FileLoaderType, filePath: string) {
		this.bot = bot;
		this.type = type;
		this.filePath = filePath;
	}

	promise(): Promise<LoadingStats> {
		const output: LoadingStats = {
			error: 0,
			success: 0,
		};
		return new Promise(async (resolve) => {
			if (!existsSync(path.join(process.cwd(), this.filePath)))
				return resolve(output);

			for (const file of readdirSync(path.join(process.cwd(), this.filePath), {
				withFileTypes: true,
			})) {
				if (file.isDirectory()) {
					const { success, error } = await new FileLoader(
						this.bot,
						this.type,
						path.join(this.filePath, file.name),
					).promise();

					output.success += success;
					output.error += error;
				} else {
					if (!file.name.endsWith('.js')) continue;
					const classFile:
						| typeof Event
						| typeof Command
						| typeof ContextMenu
						| typeof Button
						| typeof SelectMenu = (
						await import(path.join(process.cwd(), this.filePath, file.name))
					)?.default;

					if (!classFile) {
						this.bot.logger.error(
							this.logString(`${chalk.redBright(file.name)} is invalid!`),
						);
						output.error++;
						continue;
					}

					try {
						const classPrototype = classFile.prototype;
						switch (this.type) {
							default:
								throw 'Invalid class type';
							case FileLoaderType.COMMAND:
								await this.loadCommand(classPrototype, classFile);
								break;
							case FileLoaderType.EVENT:
								await this.loadEvent(classPrototype, classFile);
								break;
							case FileLoaderType.CONTEXT_MENU:
								await this.loadContextMenu(classPrototype, classFile);
								break;
							case FileLoaderType.BUTTON:
								await this.loadButton(classPrototype, classFile);
								break;
							case FileLoaderType.SELECT_MENU:
								await this.loadSelectMenu(classPrototype, classFile);
								break;
						}
					} catch (e) {
						output.error++;
						continue;
					}

					output.success++;
					this.bot.logger.debug(
						this.logString(
							`Registered ${chalk.yellowBright(
								classFile?.name ?? file.name,
							)} successfully!`,
						),
					);
				}
				continue;
			}
			resolve(output);
		});
	}

	logString(text: string) {
		return `${
			chalk.grey('[') +
			chalk.greenBright(FileLoaderType[this.type]) +
			chalk.grey(']')
		} ${text}`;
	}

	async loadCommand(classPrototype: any, classFile: any) {
		if (!(classPrototype instanceof Command)) throw 'Invalid class type';

		this.bot.Commands.set(
			(classFile as typeof Command).name,
			classFile as typeof Command,
		);
	}

	async loadEvent(classPrototype: any, classFile: any) {
		if (!(classPrototype instanceof Event)) throw 'Invalid class type';

		let registered = await classFile.register(this.bot);
		if (!registered) {
			this.bot.logger.error(
				this.logString(
					`Unable to register ${chalk.yellowBright(classFile.name)}`,
				),
			);
			throw 'Unable to register event';
		}
		if (!this.bot.Events.get(classFile.type)) {
			this.bot.Events.set(classFile.type, new Collection());
			this.bot.logger.debug(
				this.logString(
					`Created a Event type for ${chalk.yellowBright(
						EventType[classFile.type],
					)}`,
				),
			);
		}

		this.bot.Events.get(classFile.type)?.set(
			(classFile as typeof Event).name,
			classFile as typeof Event,
		);
	}

	async loadContextMenu(classPrototype: any, classFile: any) {
		if (!(classPrototype instanceof ContextMenu)) throw 'Invalid class type';

		this.bot.ContextMenus.set(
			(classFile as typeof ContextMenu).menuName,
			classFile as typeof ContextMenu,
		);
	}
	async loadButton(classPrototype: any, classFile: any) {
		if (!(classPrototype instanceof Button)) throw 'Invalid class type';

		this.bot.Buttons.set(
			(classFile as typeof Button).name,
			classFile as typeof Button,
		);
	}
	async loadSelectMenu(classPrototype: any, classFile: any) {
		if (!(classPrototype instanceof SelectMenu)) throw 'Invalid class type';

		this.bot.SelectMenus.set(
			(classFile as typeof SelectMenu).name,
			classFile as typeof SelectMenu,
		);
	}
}
