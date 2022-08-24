import type Client from '../classes/Client.js';
import type Event from '../types/Event.js';

export const event: Event = {
	name: 'ready',
	once: true,
	async execute(client: Client) {
		new Promise(async (res, rej) => {
			try {
				client.log.info(
					`Ready, logged in as ${client.user?.tag || 'undefined'}!`,
				);
				res(0);
			} catch (e) {
				rej(1);
			}
		});
	},
};

export default event;
