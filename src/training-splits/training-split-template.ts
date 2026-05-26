import { formatDate } from "utils/dates";

const WEEK_DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export function createTrainingSplitFileName(date: Date): string {
	return `Training-${formatDate(date)}`;
}

export function createTrainingSplitNoteContent(date: Date): string {
	const createdDate = formatDate(date);
	const daySections = WEEK_DAYS.map((day) => `## ${day}\n`).join("\n");

	return `---
fitnessType: training-split
trainingSplitId: training-${createdDate}
created: ${createdDate}
---

# Training split

${daySections}`;
}
