import { formatDate } from "utils/dates";
import { escapeDoubleQuotedString } from "utils/strings";

export interface WorkoutLogExercise {
	exerciseLink: string;
	sets: number;
	prescription: string;
}

export interface WorkoutLogTemplateData {
	date: Date;
	scheduledDay: string;
	sourceTrainingSplitName: string;
	exercises: WorkoutLogExercise[];
}

export function createWorkoutLogFileName(date: Date, scheduledDay: string): string {
	return `${formatDate(date)} ${scheduledDay} workout`;
}

export function createWorkoutLogNoteContent(data: WorkoutLogTemplateData): string {
	const workoutDate = formatDate(data.date);
	const exerciseSections = data.exercises.length > 0
		? data.exercises.map(createExerciseSection).join("\n")
		: "No exercises scheduled.\n";

	return `---
workoutDate: ${workoutDate}
sourceTrainingSplit: "[[${escapeDoubleQuotedString(data.sourceTrainingSplitName)}]]"
scheduledDay: ${data.scheduledDay}
---

# ${data.scheduledDay} workout

Source split: [[${data.sourceTrainingSplitName}]]

## Exercises

${exerciseSections}`;
}

function createExerciseSection(exercise: WorkoutLogExercise): string {
	return `### ${exercise.exerciseLink}

Prescription: ${exercise.prescription}

| Set | Weight | Reps | RPE | Notes |
| --- | ---: | ---: | ---: | --- |
${createSetRows(exercise.sets)}
`;
}

function createSetRows(setCount: number): string {
	return Array.from({ length: setCount }, (_, index) => `| ${index + 1} |  |  |  |  |`).join("\n");
}
