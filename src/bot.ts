// Require the necessary discord.js classes
import { GatewayIntentBits } from 'discord.js';
import Client from './classes/Client.js';
import 'dotenv/config';

const client = new Client(
	{ intents: [GatewayIntentBits.Guilds] },
	{
		permissions: {
			roles: { admin: ['909078703202508843', '909078703202508844'] },
		},
	},
);

await client.init(process.env.TOKEN);
