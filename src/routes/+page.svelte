<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Label, Input, Select, Button, Toast, Banner, Modal, Video, Progressbar } from 'flowbite-svelte';

	// recording uuid (str): show modal (bool)
	let showRecordingModals = {};

	import {
		ArrowRightOutline,
		LinkOutline,
		PaperPlaneOutline,
		BullhornSolid
	} from 'flowbite-svelte-icons';
	export let data;
	$: ({ session, supabase } = data);
	// Get the last 15 records from the recordings table
	const getRecordings = async () => {
		const { data, error } = await supabase
			.from('recordings')
			.select('*')
			.limit(15)
			.order('created_at', { ascending: false });
		if (error) console.log('error', error.message);
		for (const rec of data) {
			showRecordingModals[rec.uuid] = false;
		}
		return data;
	};
	function statusString(status: number) {
		switch (status) {
			case 1:
				return 'Initialising';
			case 2:
				return 'Downloading';
			case 3:
				return 'Encoding';
			case 4:
				return 'Uploading Result';
			case 5:
				return 'Complete';
			default:
				return 'Unknown';
		}
	}
	function channelString(channel: number) {
		switch (channel) {
			case 0:
				return 'BBC NEWS CHANNEL HD';
			case 1:
				return 'BBC WORLD NEWS AMERICA HD';
			case 2:
				return 'BBC ONE HD';
			case 3:
				return 'BBC ONE WALES HD';
			case 4:
				return 'BBC ONE SCOTLAND HD';
			case 5:
				return 'BBC ONE NORTHERN IRELAND HD';
			case 6:
				return 'BBC ONE CHANNEL ISLANDS HD';
			case 7:
				return 'BBC ONE EAST HD';
			case 8:
				return 'BBC ONE EAST MIDLANDS HD';
			case 9:
				return 'BBC ONE EAST YORKSHIRE & LINCONSHIRE HD';
			case 10:
				return 'BBC ONE LONDON HD';
			case 11:
				return 'BBC ONE NORTH EAST HD';
			case 12:
				return 'BBC ONE NORTH WEST HD';
			case 13:
				return 'BBC ONE SOUTH HD';
			case 14:
				return 'BBC ONE SOUTH EAST HD';
			case 15:
				return 'BBC ONE SOUTH WEST HD';
			case 16:
				return 'BBC ONE WEST HD';
			case 17:
				return 'BBC ONE WEST MIDLANDS HD';
			case 18:
				return 'BBC ONE YORKSHIRE HD';
			case 19:
				return 'BBC TWO HD';
			case 20:
				return 'BBC TWO NORTHERN IRELAND HD';
			case 21:
				return 'BBC TWO WALES DIGITAL';
			case 22:
				return 'BBC THREE HD';
			case 23:
				return 'BBC FOUR HD';
			case 24:
				return 'CBBC HD';
			case 25:
				return 'CBEEBIES HD';
			case 26:
				return 'BBC SCOTLAND HD';
			case 27:
				return 'BBC PARLIAMENT';
			case 28:
				return 'BBC ALBA';
			case 29:
				return 'S4C';
		}
	}
	export let form;
	// onmount
	onMount(() => {
		if (form?.status === 200) {
			const snackbar = document.getElementById('snackbar');
			if (snackbar) {
				snackbar.className = 'snackbar primary';
				snackbar.innerText = 'Successfully submitted form';
				snackbar.classList.add('active');
				setTimeout(() => {
					snackbar.className = snackbar.className.replace('active', '');
				}, 3000);
			}
		} else if (form?.status === 400) {
			const snackbar = document.getElementById('snackbar');
			if (snackbar) {
				snackbar.className = 'snackbar error';
				snackbar.innerText = form?.body || 'Failed to submit form';
				snackbar.classList.add('active');
				setTimeout(() => {
					snackbar.className = snackbar.className.replace('active', '');
				}, 3000);
			}
		}
	});
	let startMonth = new Date().toLocaleString('en-GB', {
		timeZone: 'Europe/London',
		month: 'numeric'
	});
	let startDay = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', day: 'numeric' });
	let startHour = new Date().toLocaleString('en-GB', {
		timeZone: 'Europe/London',
		hour: 'numeric'
	});
	let startMinute = new Date()
		.toLocaleString('en-GB', {
			timeZone: 'Europe/London',
			minute: 'numeric'
		})
		.toString()
		.padStart(2, '0');
	let channel: number;
	let length = 0;
	let lengthUnit = 1;
	let endHour: string;
	let endMinute: string;
	let startSeconds = 0;
	async function submitForm() {
		const form = document.querySelector('form');

		form?.submit();
	}
	// Set the end time based on the start time and length(and keep it updated)
	$: {
		let totalMinutes = 0;
		if (lengthUnit === 0) {
			totalMinutes = Math.floor(length / 60);
		} else if (lengthUnit === 1) {
			totalMinutes = length;
		} else if (lengthUnit === 2) {
			totalMinutes = length * 60;
		}
		let endHourN = parseInt(startHour) + Math.floor(totalMinutes / 60);
		let endMinuteN = parseInt(startMinute) + (totalMinutes % 60);
		if (endMinuteN > 59) {
			endHourN++;
			endMinuteN -= 60;
		}
		// if
		endHour = endHourN.toString().padStart(2, '0');
		endMinute = endMinuteN.toString().padStart(2, '0');
	}
	let currentJob: string;
	/** @type {import('./$types').Actions} */
	if (form && form.body) {
		currentJob = form.body;
	}
	// if currentjob exists, every 5 seconds check the database for the contents of the status searching by uuid
	setTimeout(() => {
		if (currentJob) {
			const interval = setInterval(async () => {
				const { data, error } = await supabase
					.from('recordings')
					.select('*')
					.eq('uuid', currentJob);
				if (error) {
					console.error('Error fetching recording status:', error.message);
					clearInterval(interval);
				}
				if (data && data.length > 0) {
					if (data[0].status === 7) {
						clearInterval(interval);
					}
				}
			}, 5000);
		}
	}, 5000);
</script>

<aside
	class="border-2 p-4 lg:2-xl:mx-[22rem] md:mx-[8rem] mx-2 my-10 border-black dark:border-white lg:grid md:grid lg:grid-cols-3 md:grid-cols-3"
>
	<div class="flex flex-col justify-start items-start">
		<!-- Left aligned -->
		<h1 class="text-3xl pb-2 font-bold">From</h1>
		<div class="flex flex-row">
			<div class="w-20">
				<Label for="first_name" class="mb-2 semibold">Day</Label>
				<Input
					size="md"
					min="1"
					max="23"
					type="number"
					bind:value={startDay}
					class="rounded-r-none bg-white border-black dark:bg-black dark:border-white"
				/>
			</div>
			<div class="w-20">
				<Label for="first_name" class="mb-2 semibold">Month</Label>
				<Input
					size="md"
					min="1"
					max="59"
					type="number"
					bind:value={startMonth}
					class="rounded-l-none bg-white border-black dark:bg-black dark:border-white"
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
					class="rounded-r-none bg-white border-black dark:bg-black dark:border-white"
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
					class="rounded-l-none rounded-r-none bg-white border-black dark:bg-black dark:border-white"
				/>
			</div>
			<div class="w-20">
				<Label class="mb-2 semibold">Seconds</Label>

				<Input
					size="md"
					min="0"
					max="59"
					type="number"
					bind:value={startSeconds}
					class="rounded-l-none bg-white border-black dark:bg-black dark:border-white"
				/>
			</div>
		</div>
		<Select
			size="md"
			class="w-full mt-2 bg-white border-black dark:bg-black dark:border-white"
			placeholder="Select a channel..."
		> <!-- TODO: find a way to have this happen at runtime based on an array -->
			<optgroup label="BBC NEWS" id="news">
				<option selected value="0">BBC NEWS CHANNEL HD</option>
				<option value="1">BBC WORLD NEWS AMERICA HD</option>
			</optgroup>
			<optgroup label="BBC ONE" id="one">
				<option value="2">BBC ONE HD</option>
				<option value="3">BBC ONE WALES HD</option>
				<option value="4">BBC ONE SCOTLAND HD</option>
				<option value="5">BBC ONE NORTHERN IRELAND HD</option>
				<option value="6">BBC ONE CHANNEL ISLANDS HD</option>
				<option value="7">BBC ONE EAST HD</option>
				<option value="8">BBC ONE EAST MIDLANDS HD</option>
				<option value="9">BBC ONE EAST YORKSHIRE & LINCONSHIRE HD</option>
				<option value="10">BBC ONE LONDON HD</option>
				<option value="11">BBC ONE NORTH EAST HD</option>
				<option value="12">BBC ONE NORTH WEST HD</option>
				<option value="13">BBC ONE SOUTH HD</option>
				<option value="14">BBC ONE SOUTH EAST HD</option>
				<option value="15">BBC ONE SOUTH WEST HD</option>
				<option value="16">BBC ONE WEST HD</option>
				<option value="17">BBC ONE WEST MIDLANDS HD</option>
				<option value="18">BBC ONE YORKSHIRE HD</option>
			</optgroup>
			<optgroup label="BBC TWO" id="two">
				<option value="19">BBC TWO HD</option>
				<option value="20">BBC TWO NORTHERN IRELAND HD</option>
				<option value="21">BBC TWO WALES DIGITAL</option>
			</optgroup>
			<optgroup label="OTHER" id="other">
				<option value="22">BBC THREE HD</option>
				<option value="23">BBC FOUR HD</option>
				<option value="24">CBBC HD</option>
				<option value="25">CBEEBIES HD</option>
				<option value="26">BBC SCOTLAND HD</option>
				<option value="27">BBC PARLIAMENT</option>
				<option value="28">BBC ALBA</option>
				<option value="29">S4C</option>
			</optgroup>
		</Select>
	</div>
	<div class="flex flex-col justify-center items-center py-2">
		<ArrowRightOutline />
	</div>

	<div class="flex flex-col">
		<h1 class="text-3xl pb-2 self-start font-bold">Length</h1>
		<div class="flex flex-row">
			<div class="mt-2 w-20">
				<Input
					size="md"
					type="number"
					bind:value={length}
					min="0"
					class="rounded-r-none bg-white border-black dark:bg-black dark:border-white"
				/>
			</div>
			<div class="mt-2 w-100">
				<Select
					size="md"
					class="font-semibold w-full rounded-l-none bg-white border-black dark:bg-black dark:border-white"
					items={[
						{ value: 0, name: 'Seconds' },
						{ value: 1, name: 'Minutes' },
						{ value: 2, name: 'Hours' }
					]}
					bind:value={lengthUnit}
				/>
			</div>
		</div>
		<h6 class="font-semibold text-md pt-4 self-start">Ends at {endHour}:{endMinute}</h6>
	</div>
</aside>
<div class="absolute flex flex-col justify-center items-center w-full -translate-y-[3.8rem]">
	<Button
		class="bg-black dark:bg-white dark:text-black font-extrabold"
		buttonClass="font-extrabold"
		on:click={submitForm}>Record</Button
	>
	<p class="pb-4">Status:</p>
</div>
{#if form?.tooLong}
	<div class="flex justify-center">
		<Toast
			dismissable={true}
			contentClass="flex space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse divide-gray-200 dark:divide-gray-700"
		>
			<PaperPlaneOutline class="w-5 h-5 text-primary-600 dark:text-primary-500 rotate-45" />
			<div class="ps-4 text-sm font-normal">
				Your recording is too long. Please try again or contact us to increase your limit.
			</div>
		</Toast>
	</div>
{/if}
{#if form?.startBeforeEnd}
	<div class="flex justify-center">
		<Toast
			dismissable={true}
			contentClass="flex space x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse divide-gray-200 dark:divide-gray-700"
		>
			<PaperPlaneOutline class="w-5 h-5 text-primary-600 dark:text-primary-500 rotate-45" />
			<div class="ps-4 text-sm font-normal">Your recording must start before it ends.</div>
		</Toast>
	</div>
{/if}
{#if form?.future}
	<div class="flex justify-center">
		<Toast
			dismissable={true}
			contentClass="flex space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse divide-gray-200 dark:divide-gray-700"
		>
			<PaperPlaneOutline class="w-5 h-5 text-primary-600 dark:text-primary-500 rotate-45" />
			<div class="ps-4 text-sm font-normal">We cannot record the future.</div>
		</Toast>
	</div>
{/if}
{#if form?.status === 200}
	<div class="flex justify-center">
		<Toast
			dismissable={true}
			contentClass="flex space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse divide-gray-200 dark:divide-gray-700"
		>
			<PaperPlaneOutline class="w-5 h-5 text-primary-600 dark:text-primary-500 rotate-45" />
			<div class="ps-4 text-sm font-normal">Your recording has been scheduled.</div>
		</Toast>
	</div>
{/if}

<form method="post" use:enhance>
	<input type="hidden" name="startMonth" bind:value={startMonth} required />
	<input type="hidden" name="startDay" bind:value={startDay} required />
	<input type="hidden" name="startHour" bind:value={startHour} required />
	<input type="hidden" name="startMinute" bind:value={startMinute} required />
	<input type="hidden" name="startSeconds" bind:value={startSeconds} required />
	<input type="hidden" name="channel" bind:value={channel} required />
	<input type="hidden" name="length" bind:value={length} required />
	<input type="hidden" name="lengthUnit" bind:value={lengthUnit} required />
</form>

<div class="space" />

{#await getRecordings()}
	<p class="text-center italic">Fetching recordings...</p>
{:then recordings}
	<div class="flex justify-center">
		<table
			class="lg:2-xl:mx-[22rem] md:mx-[8rem] mx-2 my-2 border-black dark:border-white w-full table-auto"
		>
			<tbody class="divide-y border-2 border-black dark:border-white">
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
							{channelString(recording.channel)}
						</td>
						<td class="p-2 border-2 border-black dark:border-white">
							{statusString(recording.status)}
						</td>
						<td class="p-2 border-2 border-black dark:border-white">
							<button type="button" on:click={() => (showRecordingModals[recording.uuid] = true)} class="cursor-pointer"><LinkOutline /></button>
							<Modal title="Recording {recording.uuid}" bind:open={showRecordingModals[recording.uuid]} autoclose>
								<p title="{recording.user}">Recorded by: <strong>bbcduser</strong></p> <!-- TODO: Have the username change, but thats not entirely needed right now -->
								<p>Recorded from: <strong>{channelString(recording.channel)}</strong></p>
								<p>Recording date/time: <strong>{(() => {
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
								})()}</strong></p> <!-- TODO: Get recording length, boy is that gonna be a pain -->
								{#if statusString(recording.status) != "Complete"}
									<p>Recording status: <strong>{statusString(recording.status)}</strong></p>
								{/if}
								<hr />
								<!-- <Progressbar progress={recording.status} /> -->
								{#if statusString(recording.status) == "Complete"} <!-- Show video if complete -->
									<Video src="https://bbcd.uk.to/video/{recording.uuid}.mp4" controls trackSrc="{recording.uuid}.mp4" />
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
{#if form?.tooLong}
	<div class="flex justify-center">
		<Toast
			dismissable={true}
			contentClass="flex space-x-4 rtl:space-x-reverse divide-x rtl:divide-x-reverse divide-gray-200 dark:divide-gray-700"
		>
			<PaperPlaneOutline class="w-5 h-5 text-primary-600 dark:text-primary-500 rotate-45" />
			<div class="ps-4 text-sm font-normal">
				Your recording is too long. Please try again or contact us to increase your limit.
			</div>
		</Toast>
	</div>
{/if}
