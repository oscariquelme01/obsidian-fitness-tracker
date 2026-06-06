import {
	Workout,
	WorkoutExercise,
	WorkoutSet,
} from "../../domain/workout";

export function serializeWorkout(workout: Workout): string {
	const exerciseSections = workout.exercises.length > 0
		? workout.exercises.map(serializeExercise).join("\n")
		: "No exercises scheduled.\n";

return `---
fitnessType: workout-log
workoutDate: ${workout.date}
sourceTrainingSplit: ${workout.sourceTrainingSplit}
scheduledDay: ${workout.scheduledDay}
---

# ${workout.title}

Source split: ${workout.sourceTrainingSplit}

## Exercises

${exerciseSections}`;
}

function serializeExercise(exercise: WorkoutExercise): string {
	return `### [[${exercise.exerciseName}]]

Prescription: ${exercise.prescription}
Notes: ${exercise.notes}

${exercise.sets.map(serializeSet).join("\n")}
`;
}

function serializeSet(set: WorkoutSet, index: number): string {
	return `- [${set.completed ? "x" : " "}] Set ${index + 1}: weight=${set.weight} reps=${set.reps} rpe=${set.rpe} notes=${set.notes}`;
}
