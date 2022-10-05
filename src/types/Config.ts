import type { Snowflake } from 'discord.js';

export default interface Config {
	permissions?: {
		roles: {
			mod?: Snowflake[];
			admin?: Snowflake[];
			user?: Snowflake[];
			muted?: Snowflake[];
		};
		users?: Snowflake[];
	};
}
