import { Invite, VoiceChannel } from 'discord.js';

export class ActivityManager {
	constructor() {}
	static all() {
		return {
			YouTube: '880218394199220334',
			'YouTube Dev': '880218832743055411',
			Poker: '755827207812677713',
			Betrayal: '773336526917861400',
			Fishing: '814288819477020702',
			Chess: '832012774040141894',
			'Chess Dev': '832012586023256104',
			Lettertile: '879863686565621790',
			Wordsnack: '879863976006127627',
			Doodlecrew: '878067389634314250',
			Awkword: '879863881349087252',
			Spellcast: '852509694341283871',
			Checkers: '832013003968348200',
			Puttparty: '763133495793942528',
			//Sketchyartist: '879864070101172255',
		} as const;
	}
	getTypes(): string[] {
		return Object.keys(ActivityManager.all());
	}

	create(voiceChannel: VoiceChannel, activity: string): Promise<Invite> {
		return new Promise((res, rej) => {
			voiceChannel
				.createInvite({
					targetType: 2,
					targetApplication: activity,
				})
				.then((invite) => {
					res(invite);
				})
				.catch((err) => {
					rej(err);
				});
		});
	}
}
