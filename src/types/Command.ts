import type {
	CommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	Snowflake,
} from 'discord.js';
import type Client from '../classes/Client.js';

export default interface Command {
	options:
		| SlashCommandBuilder
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandSubcommandsOnlyBuilder;
	execute(interaction: CommandInteraction, client?: Client): Promise<0 | 1>;
	permissions?: {
		users?: Snowflake[];
		roles?: 'admin' | 'mod' | 'unmuted';
	};
}
