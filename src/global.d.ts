// Namespace in node for env
declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: 'development' | 'production' | 'debug';
		LOG_LEVEL?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
		TOKEN: string;
		CLIENT_ID: string;
		GUILD_ID: string;
		DEV_GUILD_ID: string;
		COMMAND_MODE: 'DEV_SERVER' | 'GLOBAL';
	}
}
