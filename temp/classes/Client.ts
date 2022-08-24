import chalk from 'chalk';
import {
	AutocompleteInteraction,
	ButtonInteraction,
	Client as DClient,
	ClientOptions,
	CommandInteraction,
	ContextMenuInteraction,
	Guild,
	Interaction,
	MessageContextMenuInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	UserContextMenuInteraction,
	InteractionType,
} from 'discord.js';
import {
	ActivityManager,
	Bot,
	Command,
	Embed,
	MessageContextMenu,
	UserContextMenu,
} from '.';
import { EmbedPreset } from '../types';
import { ContextMenu } from './ContextMenu';

export class Client extends DClient {
	readonly bot: Bot;
	readonly activityManager: ActivityManager;

	constructor(bot: Bot, options: ClientOptions) {
		super(options);
		this.bot = bot;
		this.activityManager = new ActivityManager();

		this.on('newListener', (event: string) => {
			this.bot.logger.debug(
				`Added the listener "${chalk.yellowBright(event)}" to the client.`,
			);
		});

		this.on('interactionCreate', (interaction: Interaction) => {
			this.bot.logger.debug(
				`Interaction ${chalk.grey('[')}${chalk.green(
					interaction.id,
				)}${chalk.grey(']')} received!`,
			);

			try {
				if (interaction.isCommand()) return this.handleCommand(interaction);
				if (interaction.isButton()) return this.handleButton(interaction);
				if (interaction.isAutocomplete())
					return this.handleAutocomplete(interaction);
				if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
					return this.handleContextMenu(interaction);
				if (interaction.isSelectMenu())
					return this.handleSelectMenu(interaction);
				if (interaction.isModalSubmit()) return this.handleModal(interaction);
			} catch (e: Error | any) {
				this.bot.logger.error(
					`There was an error during the Interaction Processing! Error: ${chalk.redBright(
						e.message,
					)}`,
				);
				return;
			}
			return;
		});
	}

	updateCommands(): Promise<boolean> {
		const allCommands = [...this.bot.Commands, ...this.bot.ContextMenus];
		this.bot.logger.info(
			`Checking ${chalk.yellowBright('ApplicationCommands')}...`,
		);
		return new Promise(async (res) => {
			this.bot.logger.debug(
				`Fetching global ${chalk.yellowBright('ApplicationCommands')}...`,
			);
			const commands = await this.application?.commands.fetch();
			this.bot.logger.debug(
				`Fetched ${chalk.blueBright(
					commands?.size ?? 0,
				)} global ${chalk.yellowBright('ApplicationCommands')}`,
			);
			if (commands?.size) {
				this.bot.logger.debug(
					`Cleaning old global ${chalk.yellowBright('ApplicationCommands')}...`,
				);
				for (const command of commands.values()) {
					const existing = allCommands.find(
						([commandName]) =>
							commandName.toLowerCase() === command.name.toLowerCase(),
					);
					if (!existing || (existing[1].getGuilds() || []).length > 0) {
						try {
							await this.application?.commands.delete(command.id);
							this.bot.logger.debug(
								`Deleted ${chalk.blueBright(command.name)}!`,
							);
						} catch (e: Error | any) {
							this.bot.logger.error(
								`Unable to delete ${chalk.redBright(command.name)}!`,
							);
							this.bot.logger.debug(e.message);
						}
					}
				}
				this.bot.logger.debug(
					`Global ${chalk.yellowBright('ApplicationCommand')} cleaning done.`,
				);
			}

			for (const [commandName, command] of allCommands) {
				const guilds = command.getGuilds();
				if (guilds.length > 0) {
					// Guild specific
					this.bot.logger.info(
						`Checking ${chalk.blueBright(commandName)} on ${chalk.yellowBright(
							guilds.length,
						)} guild${guilds.length === 1 ? '' : 's'}...`,
					);

					for (const guildId of guilds) {
						let guild: Guild;

						try {
							guild = await this.guilds.fetch(guildId);
						} catch (e) {
							this.bot.logger.error(
								`${chalk.redBright(guildId)} is invalid! [${chalk.blueBright(
									commandName,
								)}]`,
							);
							continue;
						}

						const guildCommands = await guild.commands.fetch();
						const guildInteraction = guildCommands.find(
							(c) => c.name === commandName.toLowerCase(),
						);
						if (!guildInteraction) {
							try {
								await this.application?.commands.create(
									command.data(),
									guildId,
								);
								this.bot.logger.debug(
									`Created ${chalk.blueBright(commandName)} on ${chalk.magenta(
										guildId,
									)}.`,
								);
							} catch (e: Error | any) {
								this.bot.logger.error(
									`Unable to create ${chalk.blueBright(
										commandName,
									)} on ${chalk.magenta(guildId)}!`,
								);
								this.bot.logger.debug(e.message);
							}
						} else {
							if (!guildInteraction.equals(command.data(), true)) {
								try {
									await guildInteraction.edit(command.data());
									this.bot.logger.debug(
										`Updated ${chalk.blueBright(
											commandName,
										)} on ${chalk.magenta(guildId)}.`,
									);
								} catch (e) {
									this.bot.logger.error(
										`Unable to edit ${chalk.blueBright(
											commandName,
										)} on ${chalk.magenta(guildId)}!`,
									);
								}
							}
						}
					}
				} else {
					// Global
					this.bot.logger.info(
						`Checking ${chalk.blueBright(commandName)} globally...`,
					);
					const globalInteraction = commands?.find(
						(c) => c.name === commandName.toLowerCase(),
					);
					if (!globalInteraction) {
						try {
							await this.application?.commands.create(command.data());
							this.bot.logger.debug(
								`Created ${chalk.blueBright(commandName)} globally.`,
							);
						} catch (e: Error | any) {
							this.bot.logger.error(
								`Unable to create ${chalk.blueBright(commandName)} globally!`,
							);
							this.bot.logger.debug(e.message);
						}
					} else {
						if (!globalInteraction.equals(command.data(), true)) {
							try {
								await globalInteraction.edit(command.data());
								this.bot.logger.debug(
									`Updated ${chalk.blueBright(commandName)} globally.`,
								);
							} catch (e) {
								this.bot.logger.error(
									`Unable to edit ${chalk.blueBright(commandName)} globally!`,
								);
							}
						}
					}
				}
			}
			res(true);
		});
	}

	handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
		return new Promise(async (res) => {
			try {
				await this.bot.Commands.find(
					(c) => c.name.toLowerCase() === interaction.commandName,
				)?.autocomplete(
					this,
					interaction,
					interaction.options.getFocused(true).name,
					interaction.options.getFocused(),
				);
			} catch (e) {
				if (e) interaction.respond([]);
			}

			res();
		});
	}

	handleButton(interaction: ButtonInteraction): Promise<void> {
		return new Promise(async (res) => {
			if (interaction.customId) {
				let button = this.bot.Buttons.find(
					(b) => b.id === interaction.customId,
				);

				try {
					if (button) {
						button.execute(this, interaction);
					} else {
						const args = interaction.customId.split('-');
						const prefix = args.shift();

						button = this.bot.Buttons.find((b) => b.prefix === prefix);

						if (button) {
							button.execute(this, interaction, ...args);
						} else {
							interaction.reply({
								embeds: [
									new Embed().preset(
										this.bot,
										EmbedPreset.ERROR,
										`Invalid button!`,
									),
								],
								ephemeral: true,
							});
						}
					}
				} catch (e: Error | any) {
					await interaction.reply({
						embeds: [
							new Embed().preset(
								this.bot,
								EmbedPreset.ERROR,
								'There was an error during the command execution!',
							),
						],
						ephemeral: true,
					});

					this.bot.logger.error(
						`There was an error during the execution of ${chalk.blueBright(
							button?.name ?? interaction.customId,
						)}! Error: ${chalk.redBright(e.message)}`,
					);
				}
			}
			return res();
		});
	}

	handleSelectMenu(interaction: SelectMenuInteraction) {
		throw 'Not implemented';
	}

	handleModal(interaction: ModalSubmitInteraction): Promise<void> {
		return new Promise(async (res) => {
			if (interaction.customId) {
				let modal = this.bot.Modals.find((m) => m.id === interaction.customId);

				try {
					if (modal) {
						modal.execute(this, interaction);
					} else {
						const args = interaction.customId.split('-');
						const prefix = args.shift();

						modal = this.bot.Modals.find((m) => m.prefix === prefix);

						if (modal) {
							modal.execute(this, interaction, ...args);
						} else {
							interaction.reply({
								embeds: [
									new Embed().preset(
										this.bot,
										EmbedPreset.ERROR,
										`Invalid modal!`,
									),
								],
								ephemeral: true,
							});
						}
					}
				} catch (e: Error | any) {
					await interaction.reply({
						embeds: [
							new Embed().preset(
								this.bot,
								EmbedPreset.ERROR,
								'There was an error during the command execution!',
							),
						],
						ephemeral: true,
					});

					this.bot.logger.error(
						`There was an error during the execution of ${chalk.blueBright(
							modal?.name ?? interaction.customId,
						)}! Error: ${chalk.redBright(e.message)}`,
					);
				}
			}
			return res();
		});
	}

	handleCommand(interaction: CommandInteraction): Promise<void> {
		return new Promise(async (res) => {
			const command: typeof Command | undefined = this.bot.Commands.find(
				(c) => c.name.toLowerCase() === interaction.commandName,
			);
			if (!command) {
				await interaction.reply({
					embeds: [
						new Embed().preset(
							this.bot,
							EmbedPreset.ERROR,
							'This command does not exist!',
						),
					],
					ephemeral: true,
				});
				this.application?.commands
					.delete(interaction.commandId)
					.catch(() => {});
				this.application?.commands
					.delete(interaction.commandId, interaction.guildId || '')
					.catch(() => {});
				return res();
			}
			const allowedGuilds = command.getGuilds();
			if (
				allowedGuilds.length > 0 &&
				!allowedGuilds.includes(interaction.guildId ?? '')
			) {
				await interaction.reply({
					embeds: [
						new Embed().preset(
							this.bot,
							EmbedPreset.ERROR,
							'This command is not allowed in this guild!',
						),
					],
					ephemeral: true,
				});

				if (interaction.guildId) {
					try {
						await this.application?.commands.delete(
							interaction.commandId,
							interaction.guildId,
						);
						this.bot.logger.success(
							`Deleted ${chalk.blueBright(command.name)} from ${chalk.redBright(
								interaction.guildId,
							)}. (${chalk.grey('Guild only Command')})`,
						);
					} catch (e) {
						this.bot.logger.error(
							`Unable to delete ${chalk.blueBright(
								command.name,
							)} from ${chalk.redBright(interaction.guildId)}! (${chalk.grey(
								'Guild only Command',
							)})`,
						);
					}
				}
				return res();
			}

			try {
				await command.execute(this, interaction);
			} catch (e: Error | any) {
				await interaction.reply({
					embeds: [
						new Embed().preset(
							this.bot,
							EmbedPreset.ERROR,
							'There was an error during the command execution!',
						),
					],
					ephemeral: true,
				});
				this.bot.logger.error(
					`There was an error during the execution of ${chalk.blueBright(
						command.name,
					)}! Error: ${chalk.redBright(e.message)}`,
				);
			}
			return res();
		});
	}

	handleContextMenu(interaction: ContextMenuInteraction): Promise<void> {
		return new Promise(async (res) => {
			const menuType = ContextMenu.getType(interaction);
			const contextMenu:
				| typeof ContextMenu
				| typeof UserContextMenu
				| typeof MessageContextMenu
				| undefined = menuType
				? this.bot.ContextMenus.find(
						(c) =>
							c.menuName === interaction.commandName && c.__type === menuType,
				  )
				: undefined;

			if (!contextMenu) {
				await interaction.reply({
					embeds: [
						new Embed().preset(
							this.bot,
							EmbedPreset.ERROR,
							'This context menu does not exist!',
						),
					],
					ephemeral: true,
				});
				this.application?.commands
					.delete(interaction.commandId)
					.catch(() => {});
				this.application?.commands
					.delete(interaction.commandId, interaction.guildId || '')
					.catch(() => {});
				return res();
			}
			const allowedGuilds = contextMenu.getGuilds();
			if (
				allowedGuilds.length > 0 &&
				!allowedGuilds.includes(interaction.guildId ?? '')
			) {
				await interaction.reply({
					embeds: [
						new Embed().preset(
							this.bot,
							EmbedPreset.ERROR,
							'This context menu is not allowed in this guild!',
						),
					],
					ephemeral: true,
				});

				if (interaction.guildId) {
					try {
						await this.application?.commands.delete(
							interaction.commandId,
							interaction.guildId,
						);
						this.bot.logger.success(
							`Deleted ${chalk.blueBright(
								contextMenu.name,
							)} from ${chalk.redBright(interaction.guildId)}. (${chalk.grey(
								'Guild only Command',
							)})`,
						);
					} catch (e) {
						this.bot.logger.error(
							`Unable to delete ${chalk.blueBright(
								contextMenu.name,
							)} from ${chalk.redBright(interaction.guildId)}! (${chalk.grey(
								'Guild only Command',
							)})`,
						);
					}
				}
				return res();
			}
			try {
				switch (menuType) {
					default:
						throw 'Unknown menu type!';
					case 'MESSAGE':
						contextMenu.execute(
							this,
							interaction as MessageContextMenuInteraction,
						);
						break;
					case 'USER':
						contextMenu.execute(
							this,
							interaction as UserContextMenuInteraction,
						);
						break;
				}
			} catch (e: Error | any) {
				await interaction.reply({
					embeds: [
						new Embed().preset(
							this.bot,
							EmbedPreset.ERROR,
							'There was an error during the command execution!',
						),
					],
					ephemeral: true,
				});
				this.bot.logger.error(
					`There was an error during the execution of ${chalk.blueBright(
						contextMenu.name,
					)}! Error: ${chalk.redBright(e.message)}`,
				);
			}

			return res();
		});
	}

	login(token?: string): Promise<string> {
		this.bot.logger.info('Logging in the Client...');
		return new Promise((res) => {
			super
				.login(token)
				.then((o) => {
					this.bot.logger.success(
						`Client succesfully logged in as ${chalk.magentaBright(
							this.user?.tag || 'Unknown#0000',
						)} (${chalk.grey(this.user?.id || '000000000000000000')})!`,
					);
					res(o);

					this.bot.logger.info(
						`Invite: ${this.generateInvite({
							scopes: ['applications.commands', 'bot'],
							permissions: ['ADMINISTRATOR'],
						})}`,
					);
					this.updateCommands();
				})
				.catch((e) => {
					this.bot.logger.error(
						`Unable to login the client! Error: ${e.message}`,
					);
					res(e.message);
				});
		});
	}
}
