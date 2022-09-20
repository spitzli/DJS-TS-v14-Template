import type {
	CommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import type Client from '../classes/Client.js';

export default interface Command {
	options:
		| SlashCommandBuilder
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandSubcommandsOnlyBuilder;
	execute(interaction: CommandInteraction, client?: Client): Promise<0 | 1>;
}
