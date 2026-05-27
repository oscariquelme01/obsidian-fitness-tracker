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
	workoutTitle: string;
	sourceTrainingSplitName: string;
	exercises: WorkoutLogExercise[];
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

# ${data.workoutTitle}

Source split: [[${data.sourceTrainingSplitName}]]

## Exercises

${exerciseSections}`;
}

function createExerciseSection(exercise: WorkoutLogExercise): string {
	return `### ${exercise.exerciseLink}

Prescription: ${exercise.prescription}
Notes:

${createSetRows(exercise.sets)}
`;
}

function createSetRows(setCount: number): string {
	return Array.from({ length: setCount }, (_, index) => `- Set ${index + 1}: weight= reps= rpe= notes=`).join("\n");
}
