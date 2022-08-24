// Require the necessary discord.js classes
import { GatewayIntentBits } from 'discord.js';
import Client from './classes/Client.js';
import 'dotenv/config';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

await client.init(process.env.TOKEN);
