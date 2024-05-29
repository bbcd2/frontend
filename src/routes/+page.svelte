<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import {
		Label,
		Input,
		Select,
		Button,
		Toast,
		Banner,
		Modal,
		Video,
		Progressbar
	} from 'flowbite-svelte';

	// recording uuid (str): show modal (bool)
	let showRecordingModals: { [key: string]: Boolean } = {};

	import {
		ArrowRightOutline,
		LinkOutline,
		PaperPlaneOutline,
		BullhornSolid
	} from 'flowbite-svelte-icons';
	import { DurationUnit, FailedPostReason, SOURCES, SOURCE_IDS, Status, lookup_source_by_id, lookup_source_by_name } from '$lib';

	/** Get the last 15 records from the recordings table */
	const getRecordings = async () => {
		const { data, error } = await supabase
			.from('recordings')
			.select('*')
			.limit(15)
			.order('created_at', { ascending: false });
		if (error) console.error(error.message);
		console.debug({ data });
		return data;
	};

	/** Submit the hidden form */
	async function submitForm() {
		const form = document.querySelector('form');
		form?.submit();
	}

	/** Flash form submission status to snackbar if available */
	onMount(() => {
		if (!form) return;
		const snackbar = document.querySelector('#snackbar') as HTMLElement;
		if (!snackbar) return;
		switch (form?.status) {
			case 200:
				snackbar.className = 'snackbar primary';
				snackbar.innerText = 'Successfully submitted form';
				break;
			case 400:
				snackbar.className = 'snackbar error';
				snackbar.innerText = form?.body || 'Failed to submit form';
				snackbar.classList.add('active');
				break;
		}
		snackbar.classList.add('active');
		setTimeout(() => {
			snackbar.classList.remove('active');
		}, 3000);
	});

	/** Check status on current jobs */
	setTimeout(() => {
		if (currentJobs.length < 0) return;

		const interval: NodeJS.Timeout = setInterval(async () => {
			if (currentJobs.length < 0) return clearInterval(interval);

			for (let jobIdx = currentJobs.length - 1; jobIdx >= 0; jobIdx--) {
				const currentJob = currentJobs[jobIdx];

				// Find the job information
				const { data, error } = await supabase
					.from('recordings')
					.select('*')
					.eq('uuid', currentJob);
				if (error) {
					console.error(`Error fetching recording status: ${error.message}`);
					clearInterval(interval);
				}

				// Remove this job if complete
				if (data && data.length > 0 && data[0].status == Status.Complete) {
					currentJobs.splice(jobIdx, 1);
				}
			}
		}, 5000);
	}, 5000);

	// Form and database
	export let data;
	$: ({ supabase } = data);
	export let form;
	let currentJobs: string[] = [];

	// Inputs
	// Timezone should be in UTC+0
	const currentDate = new Date();
	let [month, day] = [currentDate.getMonth() + 1, currentDate.getDate()].map((x) => `${x}`);
	let [startHour, startMinute, startSecond] = [
		currentDate.getHours(),
		currentDate.getMinutes(),
		currentDate.getSeconds()
	].map((x) => `${x}`);
	let durationUnit = DurationUnit.Minutes;
	let duration = 0;
	// Precision of seconds, i.e. *1000 when converting to a `Date`
	let [startTimestamp, endTimestamp] = [0, 0];
	$: {
		console.log({
			duration,
			durationUnit,
			month,
			day,
			startHour,
			startMinute,
			startSecond,
			startTimestamp,
			endTimestamp
		});
		const totalSeconds = duration * 60 ** (durationUnit as number);
		console.log({ totalSeconds });
		startTimestamp =
			new Date(
				Date.UTC(
					currentDate.getUTCFullYear(),
					parseInt(month) - 1,
					parseInt(day),
					parseInt(startHour),
					parseInt(startMinute),
					parseInt(startSecond)
				)
			).getTime() / 1000;
		endTimestamp = startTimestamp + totalSeconds;
	}
	let channel = SOURCES[1];

	// Current jobs
	// The backend returns the job UUID in its body
	/** @type {import('./$types').Actions} */
	if (form && form.body) {
		currentJobs.push(form.body);
	}
</script>

<aside
	class="border-2 p-4 lg:2-xl:mx-[22rem] md:mx-[8rem] mx-2 my-10 border-black dark:border-white lg:grid md:grid lg:grid-cols-3 md:grid-cols-3"
>
	<div class="flex flex-col items-start justify-start">
		<!-- Left aligned -->
		<h1 class="pb-2 text-3xl font-bold">From</h1>
		<div class="flex flex-row">
			<div class="w-20">
				<Label for="first_name" class="mb-2 semibold">Day</Label>
				<Input
					size="md"
					min="1"
					max="23"
					type="number"
					bind:value={day}
					class="bg-white border-black rounded-r-none dark:bg-black dark:border-white"
				/>
			</div>
			<div class="w-20">
				<Label for="first_name" class="mb-2 semibold">Month</Label>
				<Input
					size="md"
					min="1"
					max="12"
					type="number"
					bind:value={month}
					class="bg-white border-black rounded-l-none dark:bg-black dark:border-white"
				/>
			</div>
		</div>

		<div class="flex items-center mt-2">
			<div class="w-20">
				<Label class="mb-2 semibold">Hour</Label>
				<Input
					size="md"
					min="0"
					max="23"
					type="number"
					bind:value={startHour}
					class="bg-white border-black rounded-r-none dark:bg-black dark:border-white"
				/>
			</div>
			<div class="w-20">
				<Label class="mb-2 semibold">Minute</Label>
				<Input
					size="md"
					min="0"
					max="59"
					type="number"
					bind:value={startMinute}
					class="bg-white border-black rounded-l-none rounded-r-none dark:bg-black dark:border-white"
				/>
			</div>
			<div class="w-20">
				<Label class="mb-2 semibold">Seconds</Label>
				<Input
					size="md"
					min="0"
					max="59"
					type="number"
					bind:value={startSecond}
					class="bg-white border-black rounded-l-none dark:bg-black dark:border-white"
				/>
			</div>
		</div>
		<Select
			size="md"
			class="w-full mt-2 bg-white border-black dark:bg-black dark:border-white"
			bind:value={channel}
			placeholder="Select channel..."
		>
			{#each Object.entries(SOURCES) as [channelGroup, channels]}
				<optgroup label={channelGroup}>
					{#each channels as channel}
						<option value={lookup_source_by_name(channel)}>{channel}</option>
					{/each}
				</optgroup>
			{/each}
		</Select>
	</div>
	<div class="flex flex-col items-center justify-center py-2">
		<ArrowRightOutline />
	</div>

	<div class="flex flex-col">
		<h1 class="self-start pb-2 text-3xl font-bold">Length</h1>
		<div class="flex flex-row">
			<div class="w-20 mt-2">
				<Input
					size="md"
					type="number"
					bind:value={duration}
					min="0"
					class="bg-white border-black rounded-r-none dark:bg-black dark:border-white"
				/>
			</div>
			<div class="mt-2 w-100">
				<Select
					size="md"
					class="w-full font-semibold bg-white border-black rounded-l-none dark:bg-black dark:border-white"
					items={[
						{ value: 0, name: 'Seconds' },
						{ value: 1, name: 'Minutes' },
						{ value: 2, name: 'Hours' }
					]}
					bind:value={durationUnit}
				/>
			</div>
		</div>
		<h6 class="self-start pt-4 font-semibold text-md">
			Ends at {new Date(endTimestamp * 1000).toLocaleString('en-GB', {
				timeZone: 'UTC',
				minute: 'numeric',
				hour: 'numeric',
				second: 'numeric',
				hour12: false
			})} (UTC+0)
		</h6>
	</div>
</aside>
<div class="absolute flex flex-col justify-center items-center w-full -translate-y-[3.8rem]">
	<Button
		class="font-extrabold bg-black dark:bg-white dark:text-black"
		buttonClass="font-extrabold"
		on:click={submitForm}>Record</Button
	>
	<p class="pb-4">Status:</p>
</div>
<div class="flex justify-center">
	<Toast
		dismissable={true}
		contentClass="flex space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse divide-gray-200 dark:divide-gray-700"
	>
		<PaperPlaneOutline class="w-5 h-5 rotate-45 text-primary-600 dark:text-primary-500" />
		<div class="text-sm font-normal ps-4">
			{#if form?.error}
				{form?.error.toString()}
			{/if}
			{#if form?.status === 200}
				<div class="text-sm font-normal ps-4">Your recording has been scheduled.</div>
			{/if}
		</div>
	</Toast>
</div>

<form method="post" use:enhance>
	<input type="hidden" name="startTimestamp" bind:value={startTimestamp} required />
	<input type="hidden" name="endTimestamp" bind:value={endTimestamp} required />
	<input type="hidden" name="channel" bind:value={channel} required />
</form>

<div class="space" />

{#await getRecordings()}
	<p class="italic text-center">Fetching recordings...</p>
{:then recordings}
	<div class="flex justify-center">
		<table
			class="lg:2-xl:mx-[22rem] md:mx-[8rem] mx-2 my-2 border-black dark:border-white w-full table-auto"
		>
			<tbody class="border-2 border-black divide-y dark:border-white">
				{#each recordings ?? [] as recording}
					<tr
						><td class="p-2 border-2 border-black dark:border-white">
							{(() => {
								const startDate = new Date(recording.rec_start * 1000);
								const endDate = new Date(recording.rec_end * 1000);
								const sameDay =
									startDate.getDate() === endDate.getDate() &&
									startDate.getMonth() === endDate.getMonth() &&
									startDate.getFullYear() === endDate.getFullYear();
								return sameDay
									? startDate.toLocaleDateString('en-GB', {
											month: 'short',
											day: '2-digit',
											timeZone: 'Europe/London'
										})
									: startDate.toLocaleDateString('en-GB', {
											month: 'short',
											day: '2-digit',
											timeZone: 'Europe/London'
										}) +
											' - ' +
											endDate.toLocaleDateString('en-GB', {
												month: 'short',
												day: '2-digit',
												timeZone: 'Europe/London'
											});
							})()}
						</td>
						<td class="p-2 border-2 border-black dark:border-white">
							{(() => {
								const startDate = new Date(recording.rec_start * 1000);
								const endDate = new Date(recording.rec_end * 1000);
								return (
									startDate.toLocaleTimeString('en-GB', {
										hour: '2-digit',
										minute: '2-digit',
										timeZone: 'Europe/London'
									}) +
									' - ' +
									endDate.toLocaleTimeString('en-GB', {
										hour: '2-digit',
										minute: '2-digit',
										timeZone: 'Europe/London'
									})
								);
							})()}
						</td>
						<td class="p-2 border-2 border-black dark:border-white">
							{lookup_source_by_id(recording.channel)}
						</td>
						<td class="p-2 border-2 border-black dark:border-white">
							{Status[Math.min(Status['_SENTINEL_MAX'] - 1, recording.status)]}
						</td>
						<td class="p-2 border-2 border-black dark:border-white">
							<button
								type="button"
								on:click={() => (showRecordingModals[recording.uuid] = true)}
								class="cursor-pointer"><LinkOutline /></button
							>
							<Modal
								title="Recording {recording.uuid}"
								bind:open={showRecordingModals[recording.uuid]}
								autoclose
							>
								<p title={recording.user}>Recorded by: <strong>bbcduser</strong></p>
								<!-- TODO: Have the username change, but thats not entirely needed right now -->
								<p>Recorded from: <strong>{lookup_source_by_id(recording.channel)}</strong></p>
								<p>
									Recording date/time: <strong
										>{(() => {
											const startDate = new Date(recording.rec_start * 1000);
											const endDate = new Date(recording.rec_end * 1000);
											const sameDay =
												startDate.getDate() === endDate.getDate() &&
												startDate.getMonth() === endDate.getMonth() &&
												startDate.getFullYear() === endDate.getFullYear();
											return sameDay
												? startDate.toLocaleDateString('en-GB', {
														month: 'short',
														day: '2-digit',
														timeZone: 'Europe/London'
													})
												: startDate.toLocaleDateString('en-GB', {
														month: 'short',
														day: '2-digit',
														timeZone: 'Europe/London'
													}) +
														' - ' +
														endDate.toLocaleDateString('en-GB', {
															month: 'short',
															day: '2-digit',
															timeZone: 'Europe/London'
														});
										})()} | {(() => {
											const startDate = new Date(recording.rec_start * 1000);
											const endDate = new Date(recording.rec_end * 1000);
											return (
												startDate.toLocaleTimeString('en-GB', {
													hour: '2-digit',
													minute: '2-digit',
													timeZone: 'Europe/London'
												}) +
												' - ' +
												endDate.toLocaleTimeString('en-GB', {
													hour: '2-digit',
													minute: '2-digit',
													timeZone: 'Europe/London'
												})
											);
										})()}</strong
									>
								</p>
								<!-- TODO: Get recording length, boy is that gonna be a pain -->
								{#if Math.min(Status['_SENTINEL_MAX'] - 1, recording.status) != Status['Complete']}
									<p>
										Recording status: <strong
											>{Status[Math.min(Status['_SENTINEL_MAX'] - 1, recording.status)]}</strong
										>
									</p>
								{/if}
								<hr />

								{#if Math.min(Status['_SENTINEL_MAX'] - 1, recording.status) != Status['Complete']}
									<Progressbar
										progress={Math.min(100, recording.status * (100 / (Status['_SENTINEL_MAX'] - 1)))}
										color="gray"
									/>
								{/if}

								{#if Math.min(Status['_SENTINEL_MAX'] - 1, recording.status) == Status['Complete']}
									<!-- Show video if complete -->
									<Video
										src="https://bbcd.uk.to/video/{recording.uuid}.mp4"
										controls
										trackSrc="{recording.uuid}.mp4"
									/>
								{/if}
							</Modal>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:catch error}
	<p>Failed to fetch recordings: {error.message}</p>
{/await}
