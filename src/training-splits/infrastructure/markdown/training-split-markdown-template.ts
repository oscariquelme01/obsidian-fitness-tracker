import { formatDate } from "shared/domain/dates";

export function createTrainingSplitFileName(date: Date): string {
	return `Training-${formatDate(date)}`;
}

export function createTrainingSplitNoteContent(date: Date): string {
	return `---
fitnessType: training-split
created: ${formatDate(date)}
---

# Training split

Use \`## Monday: Push day\` headings and exercise bullets formatted as \`- [[Exercise]] | 3 sets | 8 reps | RPE 8\`.

## Monday: Push day

- [[Bench press]] | 3 sets | 8 reps

## Tuesday: Rest

## Wednesday: Pull day

- [[Pull up]] | 3 sets | 8 reps

## Thursday: Rest

## Friday: Legs

- [[Squat]] | 3 sets | 8 reps
`;
}
