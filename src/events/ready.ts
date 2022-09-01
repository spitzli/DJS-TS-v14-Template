import type Client from '../classes/Client.js';
import type Event from '../types/Event.js';
import { performance } from 'perf_hooks';
import chalk from 'chalk';

export const event: Event = {
	name: 'ready',
	once: true,
	async execute(client: Client) {
		new Promise(async (res, rej) => {
			try {
				client.log.info(
					`Ready, logged in as ${chalk.cyanBright(
						client.user?.tag || 'undefined',
					)} - took ${chalk.blue(
						`${Math.floor(performance.now() - client.startTime)}ms`,
					)}`,
				);
				res(0);
			} catch (e) {
				rej(1);
			}
		});
	},
};

export default event;
