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
export function lookup_source_by_id(id: number): string {
	// i am so sorry to all my loved ones.
	const lengths = Object.values(SOURCES).map((channelList) => channelList.length);
	let subgroup = 0;
	let subgroupIdx = 0;
	for (let idx = 0; idx < Object.keys(SOURCES).length; idx++) {
		subgroupIdx += 1;
		if (subgroupIdx > lengths[subgroup] - 1) subgroupIdx = 0;
	}
	return Object.values(SOURCES)[subgroup][subgroupIdx];
}

export const SOURCE_IDS = {
	'BBC NEWS CHANNEL HD': "0",
	'BBC WORLD NEWS AMERICA HD': "1",
	'BBC ONE HD': "2",
	'BBC ONE WALES HD': "3",
	'BBC ONE SCOTLAND HD': "4",
	'BBC ONE NORTHERN IRELAND HD': "5",
	'BBC ONE CHANNEL ISLANDS HD': "6",
	'BBC ONE EAST HD': "7",
	'BBC ONE EAST MIDLANDS HD': "8",
	'BBC ONE EAST YORKSHIRE & LINCONSHIRE HD': "9",
	'BBC ONE LONDON HD': "10",
	'BBC ONE NORTH EAST HD': "11",
	'BBC ONE NORTH WEST HD': "12",
	'BBC ONE SOUTH HD': "13",
	'BBC ONE SOUTH EAST HD': "14",
	'BBC ONE SOUTH WEST HD': "15",
	'BBC ONE WEST HD': "16",
	'BBC ONE WEST MIDLANDS HD': "17",
	'BBC ONE YORKSHIRE HD': "18",
	'BBC TWO HD': "19",
	'BBC TWO NORTHERN IRELAND HD': "20",
	'BBC TWO WALES DIGITAL': "21",
	'BBC THREE HD': "22",
	'BBC FOUR HD': "23",
	'CBBC HD': "24",
	'CBEEBIES HD': "25",
	'BBC SCOTLAND HD': "26",
	'BBC PARLIAMENT': "27",
	'BBC ALBA': "28",
	'S4C': "29",
};
export function lookup_source_by_name(name: string): string {
	switch (name) {
		case "BBC NEWS CHANNEL HD": return "0"
		case "BBC WORLD NEWS AMERICA HD": return "1"
		case "BBC ONE HD": return "2"
		case "BBC ONE WALES HD": return "3"
		case "BBC ONE SCOTLAND HD": return "4"
		case "BBC ONE NORTHERN IRELAND HD": return "5"
		case "BBC ONE CHANNEL ISLANDS HD": return "6"
		case "BBC ONE EAST HD": return "7"
		case "BBC ONE EAST MIDLANDS HD": return "8"
		case "BBC ONE EAST YORKSHIRE & LINCONSHIRE HD": return "9"
		case "BBC ONE LONDON HD": return "10"
		case "BBC ONE NORTH EAST HD": return "11"
		case "BBC ONE NORTH WEST HD": return "12"
		case "BBC ONE SOUTH HD": return "13"
		case "BBC ONE SOUTH EAST HD": return "14"
		case "BBC ONE SOUTH WEST HD": return "15"
		case "BBC ONE WEST HD": return "16"
		case "BBC ONE WEST MIDLANDS HD": return "17"
		case "BBC ONE YORKSHIRE HD": return "18"
		case "BBC TWO HD": return "19"
		case "BBC TWO NORTHERN IRELAND HD": return "20"
		case "BBC TWO WALES DIGITAL": return "21"
		case "BBC THREE HD": return "22"
		case "BBC FOUR HD": return "23"
		case "CBBC HD": return "24"
		case "CBEEBIES HD": return "25"
		case "BBC SCOTLAND HD": return "26"
		case "BBC PARLIAMENT": return "27"
		case "BBC ALBA": return "28"
		case "S4C": return "29"
		default: return "0"
	}
}