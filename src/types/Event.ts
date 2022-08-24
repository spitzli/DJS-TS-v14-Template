import type { ClientEvents } from 'discord.js';
import type Client from '../classes/Client.js';

export default interface Event {
	name: keyof ClientEvents;
	once?: boolean;
	execute(client: Client, ...args: any[]): Promise<void>;
}
