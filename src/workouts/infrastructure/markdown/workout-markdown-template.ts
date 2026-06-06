import { formatDate } from "shared/domain/dates";
import { escapeDoubleQuotedString } from "shared/domain/strings";

export interface WorkoutExercise {
	exerciseName: string;
	prescription: string;
	sets: number;
}

export interface WorkoutTemplateData {
	date: Date;
	scheduledDay: string;
	workoutTitle: string;
	sourceTrainingSplitPath: string;
	sourceTrainingSplitName: string;
	exercises: WorkoutExercise[];
}

export function createWorkoutNoteContent(data: WorkoutTemplateData): string {
	const exerciseSections = data.exercises.length > 0
		? data.exercises.map(createExerciseSection).join("\n")
		: "No exercises scheduled.\n";

	return `---
fitnessType: workout-log
workoutDate: ${formatDate(data.date)}
sourceTrainingSplit: "${escapeDoubleQuotedString(data.sourceTrainingSplitPath)}"
scheduledDay: ${data.scheduledDay}
---

# ${data.workoutTitle}

Source split: [[${data.sourceTrainingSplitName}]]

## Exercises

${exerciseSections}`;
}

function createExerciseSection(exercise: WorkoutExercise): string {
	return `### [[${exercise.exerciseName}]]

Prescription: ${exercise.prescription}
Notes:

${createSetRows(exercise.sets)}
`;
}

function createSetRows(setCount: number): string {
	return Array.from({ length: setCount }, (_, index) => {
		return `- [ ] Set ${index + 1}: weight= reps= rpe= notes=`;
	}).join("\n");
}
