import chalk from 'chalk';
import { ClientOptions, Collection } from 'discord.js';
import {
	Button,
	Client,
	Command,
	Event,
	FileLoader,
	JsonDatabase,
	Logger,
	Modal,
	SelectMenu,
	SqlDatabase,
	Utils,
} from '.';
import {
	BootOptions,
	BotConfig,
	BotOptions,
	ClientColors,
	ClientEmojis,
	EventType,
	FileLoaderType,
	LoadingStats,
} from '../types';
import { ContextMenu } from './ContextMenu';

export class Bot {
	static id = 0;
	public static readonly clients: Record<number, Bot> = {};

	readonly id: number;
	readonly ClientOptions: ClientOptions;
	readonly Config: BotConfig;
	readonly Commands: Collection<string, typeof Command> = new Collection();
	readonly Events: Collection<EventType, Collection<string, typeof Event>> =
		new Collection();
	readonly Buttons: Collection<string, typeof Button> = new Collection();
	readonly SelectMenus: Collection<string, typeof SelectMenu> =
		new Collection();
	readonly Modals: Collection<string, typeof Modal> = new Collection();
	readonly ContextMenus: Collection<string, typeof ContextMenu> =
		new Collection();
	readonly options: BootOptions = {
		debug: false,
	};
	readonly client: Client;
	readonly logger = new Logger(this);
	public readonly database: SqlDatabase | JsonDatabase;
	public readonly cache = {};
	readonly utils = new Utils(this);
	readonly Emojis: ClientEmojis;
	readonly Colors: ClientColors;

	setCommands(filePath: string, keepOld?: boolean): Promise<LoadingStats> {
		if (!keepOld) this.Commands.clear();

		return new FileLoader(this, FileLoaderType.COMMAND, filePath).promise();
	}

	setContextMenus(filePath: string, keepOld?: boolean): Promise<LoadingStats> {
		if (!keepOld) this.ContextMenus.clear();

		return new FileLoader(
			this,
			FileLoaderType.CONTEXT_MENU,
			filePath,
		).promise();
	}

	setEvents(filePath: string, keepOld?: boolean): Promise<LoadingStats> {
		if (!keepOld) this.Events.clear();

		return new FileLoader(this, FileLoaderType.EVENT, filePath).promise();
	}

	setButtons(filePath: string, keepOld?: boolean): Promise<LoadingStats> {
		if (!keepOld) this.Buttons.clear();

		return new FileLoader(this, FileLoaderType.BUTTON, filePath).promise();
	}

	setSelectMenus(filePath: string, keepOld?: boolean): Promise<LoadingStats> {
		if (!keepOld) this.SelectMenus.clear();

		return new FileLoader(this, FileLoaderType.SELECT_MENU, filePath).promise();
	}

	constructor(options: BotOptions) {
		const {
			config,
			database,
			commandsPath,
			contextMenusPath,
			eventsPath,
			buttonsPath,
			selectMenusPath,
			colors,
			emojis,
			client,
		} = options;

		this.id = Bot.id++;

		Bot.clients[this.id] = this;

		this.logger.info(
			`Client ${chalk.cyan('BOT-')}${chalk.cyanBright(this.id)} created!`,
		);

		this.Config = config;
		this.Colors = colors;
		this.Emojis = emojis;
		this.ClientOptions = client;

		if (!database) throw new Error('No database provided!');
		this.database = database;
		this.logger.info(
			`Selected ${chalk.magentaBright(
				Object.getPrototypeOf(this.database).constructor.name,
			)} as Database.`,
		);

		if (this.database.isJsonDatabase()) this.database.log(this);

		this.client = new Client(this, this.ClientOptions);

		if (commandsPath) {
			this.logger.info(`Loading ${chalk.yellowBright('Commands')}...`);
			this.setCommands(commandsPath).then(({ success, error }) => {
				this.logger.info(
					`Loaded ${chalk.greenBright(success)} ${chalk.yellowBright(
						`Command${success === 1 ? '' : 's'}`,
					)}. ${chalk.redBright(error)} invalid!`,
				);
			});
		} else {
			this.logger.info(`${chalk.yellowBright('Command')} path unset!`);
		}

		if (contextMenusPath) {
			this.logger.info(`Loading ${chalk.yellowBright('ContextMenus')}...`);
			this.setContextMenus(contextMenusPath).then(({ success, error }) => {
				this.logger.info(
					`Loaded ${chalk.greenBright(success)} ${chalk.yellowBright(
						`ContextMenu${success === 1 ? '' : 's'}`,
					)}. ${chalk.redBright(error)} invalid!`,
				);
			});
		} else {
			this.logger.info(`${chalk.yellowBright('ContextMenus')} path unset!`);
		}

		if (eventsPath) {
			this.logger.info(`Loading ${chalk.yellowBright('Events')}...`);
			this.setEvents(eventsPath).then(({ success, error }) => {
				this.logger.info(
					`Loaded ${chalk.greenBright(success)} ${chalk.yellowBright(
						`Event${success === 1 ? '' : 's'}`,
					)}. ${chalk.redBright(error)} invalid!`,
				);
			});
		} else {
			this.logger.info(`${chalk.yellowBright('Event')} path unset!`);
		}

		if (buttonsPath) {
			this.logger.info(`Loading ${chalk.yellowBright('Buttons')}...`);
			this.setButtons(buttonsPath).then(({ success, error }) => {
				this.logger.info(
					`Loaded ${chalk.greenBright(success)} ${chalk.yellowBright(
						`Button${success === 1 ? '' : 's'}`,
					)}. ${chalk.redBright(error)} invalid!`,
				);
			});
		} else {
			this.logger.info(`${chalk.yellowBright('Buttons')} path unset!`);
		}

		if (selectMenusPath) {
			this.logger.info(`Loading ${chalk.yellowBright('SelectMenus')}...`);
			this.setSelectMenus(selectMenusPath).then(({ success, error }) => {
				this.logger.info(
					`Loaded ${chalk.greenBright(success)} ${chalk.yellowBright(
						`SelectMenu${success === 1 ? '' : 's'}`,
					)}. ${chalk.redBright(error)} invalid!`,
				);
			});
		} else {
			this.logger.info(`${chalk.yellowBright('SelectMenus')} path unset!`);
		}

		this.client.login(this.Config.token);
	}
}
