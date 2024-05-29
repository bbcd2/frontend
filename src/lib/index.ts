export enum FailedPostReason {
	TooLong = 'Your recording is too long. Please try again or contact us to increase your limit.',
	StartBeforeEnd = 'The start timestamp is before the end timestamp.',
	Future = "We can't record the future(!)"
}

export enum DurationUnit {
	Seconds = 0,
	Minutes = 1,
	Hours = 2
}

export enum Status {
	'Initialising' = 1,
	'Downloading' = 2,
	'Encoding' = 3,
	'Uploading Result' = 4,
	'Complete' = 5,
	'_SENTINEL_MAX' = 6
}

// prettier-ignore
export const SOURCES: { [key: string]: string[] } = {
	'BBC NEWS': [
		'BBC NEWS CHANNEL HD',
		'BBC WORLD NEWS AMERICA HD'
	],
	'BBC ONE': [
		'BBC ONE HD',
		'BBC ONE WALES HD',
		'BBC ONE SCOTLAND HD',
		'BBC ONE NORTHERN IRELAND HD',
		'BBC ONE CHANNEL ISLANDS HD',
		'BBC ONE EAST HD',
		'BBC ONE EAST MIDLANDS HD',
		'BBC ONE EAST YORKSHIRE & LINCONSHIRE HD',
		'BBC ONE LONDON HD',
		'BBC ONE NORTH EAST HD',
		'BBC ONE NORTH WEST HD',
		'BBC ONE SOUTH HD',
		'BBC ONE SOUTH EAST HD',
		'BBC ONE SOUTH WEST HD',
		'BBC ONE WEST HD',
		'BBC ONE WEST MIDLANDS HD',
		'BBC ONE YORKSHIRE HD',
	],
	'BBC TWO': [
		'BBC TWO HD',
		'BBC TWO NORTHERN IRELAND HD',
		'BBC TWO WALES DIGITAL',
	],
	OTHER: [
		'BBC THREE HD',
		'BBC FOUR HD',
		'CBBC HD',
		'CBEEBIES HD',
		'BBC SCOTLAND HD',
		'BBC PARLIAMENT',
		'BBC ALBA',
		'S4C',
	]
};
export function lookupSourceById(id: number): string {
	return Object.values(SOURCES).flat(1)[id];
}
