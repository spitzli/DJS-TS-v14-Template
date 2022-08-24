import type Client from '../classes/Client';

export default {
	name: 'ready',
	once: true,
	execute(client: Client) {
		console.log(`Ready! Logged in as ${client.user?.tag || 'undefined'}`);
	},
};
