import axios from 'axios';

import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const channel = Number(data.get('channel'));
		// Construct the start and end timestamps
		const startMonth = Number(data.get('startMonth'));
		const startDay = Number(data.get('startDay'));
		const startHour = Number(data.get('startHour'));
		const startMinute = Number(data.get('startMinute'));
		var duration = Number(data.get('length'));
		const durationUnit = data.get('lengthUnit');
		// If duration unit is 0, seconds, 1, minutes, 2, hours
		if (durationUnit === '0') {
			duration = duration;
		} else if (durationUnit === '1') {
			duration = duration * 60;
		} else if (durationUnit === '2') {
			duration = duration * 3600;
		}
		// Make the timestamps in London time
		let startTimestamp =
			new Date(Date.UTC(2024, startMonth - 1, startDay, startHour, startMinute)).getTime() / 1000;
		console.log('duration: ', duration);
		let endTimestamp = startTimestamp + duration;
		// Adjust the timestamps for the time zone difference
		startTimestamp -= 7200;
		endTimestamp -= 7200;
		console.log('startTimestamp: ', startTimestamp);
		console.log('endTimestamp: ', endTimestamp);
		// If the start timestamp is greater than the end timestamp, return an error
		if (startTimestamp > endTimestamp) {
			console.log('start before end');
			return fail(400, { startBeforeEnd: true });
		}
		// If the start or end timestamps are in the future
		if (startTimestamp > Date.now() / 1000 || endTimestamp > Date.now() / 1000) {
			console.log('future');
			return fail(400, { future: true });
		}
		// If the start and end timestamps are more than 1 hour apart
		if (endTimestamp - startTimestamp > 3600) {
			console.log('no hours');
			return fail(400, { tooLong: true });
		}
		if (channel === 1) {
			console.log('contacting vell');
			// Contact 100.64.1.2:3001 via AXIOS
			console.log(`body: ${startTimestamp}, ${endTimestamp}, ${channel}`);
			const response = await axios.post('http://100.64.1.5:3001/downloadVideo', {
				startTimestamp: startTimestamp,
				endTimestamp: endTimestamp,
				channel: channel
			});
			return { status: 200, body: await response.data };
		}
		// Get the time of day
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		console.log('entering time loop');
		if (
			hours > 22 ||
			(hours === 22 && minutes >= 45) ||
			hours < 7 ||
			(hours === 7 && minutes < 15)
		) {
			console.log('contacting local server');
			// Contact 100.64.1.2:3001 via AXIOS
			console.log(`body: ${startTimestamp}, ${endTimestamp}, ${channel}`);
			const response = await axios.post('http://127.0.0.1:3001/downloadVideo', {
				startTimestamp: startTimestamp,
				endTimestamp: endTimestamp,
				channel: channel
			});
			return { status: 200, body: await response.data };
		} else {
			console.log('contacting hp');
			console.log(`body: ${startTimestamp}, ${endTimestamp}, ${channel}`);
			// Contact 100.64.1.3:3001 via AXIOS
			const response = await axios.post('http://100.64.1.3:3001/downloadVideo', {
				startTimestamp: startTimestamp,
				endTimestamp: endTimestamp,
				channel: channel
			});
			return { status: 200, body: await response.data };
		}
	}
};
