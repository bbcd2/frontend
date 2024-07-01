import axios from 'axios';

import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { FailedPostReason } from '$lib';

const getBackendServerIp = (channel: string): string => {
	// return '127.0.0.1:3001';

	// Val's Vell handles World News America
	if (channel == 'BBC WORLD NEWS AMERICA HD') {
		return '100.64.1.5:3001';
	}
	// Between 22:45 and 07:15, handle locally
	const date = new Date();
	if (
		date.getHours() > 22 ||
		(date.getHours() === 22 && date.getMinutes() >= 45) ||
		date.getHours() < 7 ||
		(date.getHours() === 7 && date.getMinutes() < 15)
	) {
		return '127.0.0.1:3001';
	}
	// Beatrice handles the rest!
	return '100.64.1.3:3001';
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		let [startTimestamp, endTimestamp] = ['startTimestamp', 'endTimestamp'].map((key) =>
			Number(data.get(key)!)
		);
		const channel = data.get('channel')!.toString();
		const encode = data.get('encode')!.toString() === 'true';

		// Validation
		if (startTimestamp > endTimestamp) {
			return fail(400, { error: FailedPostReason.StartBeforeEnd });
		}
		if (startTimestamp > Date.now() / 1000 || endTimestamp > Date.now() / 1000) {
			return fail(400, { error: FailedPostReason.Future });
		}
		if (endTimestamp - startTimestamp > 3600) {
			return fail(400, { error: FailedPostReason.TooLong });
		}

		try {
			var response = await axios.post(`http://${getBackendServerIp(channel)}/downloadVideo`, {
				startTimestamp,
				endTimestamp,
				channel,
				encode
			});
		} catch (e) {
			// If it was world news america, the error is unrecoverable(we only have one server to handle that)
			if (channel == 'BBC WORLD NEWS AMERICA HD') {
				return fail(500, { error: FailedPostReason.FailedSend });
			} else {
				// If it wasn't, we can try the local server
				try {
					var response = await axios.post(`http://127.0.0.1:3001/downloadVideo`, {
						startTimestamp,
						endTimestamp,
						channel,
						encode
					});
				} catch (e) {
					// If that fails, we can't do anything
					return fail(500, { error: FailedPostReason.FailedSend });
				}
			}
			return fail(500, { error: FailedPostReason.FailedSend });
		}
		return { status: 200, body: await response.data };
	}
};
