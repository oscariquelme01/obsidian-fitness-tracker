import {
	WorkoutLog,
	WorkoutLogExerciseEntry,
	WorkoutLogSetEntry,
} from "../../domain/workout-log";

export function serializeWorkoutLog(workoutLog: WorkoutLog): string {
	const exerciseSections = workoutLog.exercises.length > 0
		? workoutLog.exercises.map(serializeExercise).join("\n")
		: "No exercises scheduled.\n";

	return `---
fitnessType: ${workoutLog.frontmatter.fitnessType || "workout-log"}
workoutDate: ${workoutLog.frontmatter.workoutDate}
sourceTrainingSplit: ${workoutLog.frontmatter.sourceTrainingSplit}
scheduledDay: ${workoutLog.frontmatter.scheduledDay}
---

# ${workoutLog.title}

Source split: ${workoutLog.sourceTrainingSplit}

## Exercises

${exerciseSections}`;
}

function serializeExercise(exercise: WorkoutLogExerciseEntry): string {
	return `### ${exercise.exerciseLink}

Prescription: ${exercise.prescription}
Notes: ${exercise.notes}

${exercise.sets.map(serializeSet).join("\n")}
`;
}

function serializeSet(set: WorkoutLogSetEntry, index: number): string {
	return `- [${set.completed ? "x" : " "}] Set ${index + 1}: weight=${set.weight} reps=${set.reps} rpe=${set.rpe} notes=${set.notes}`;
}
