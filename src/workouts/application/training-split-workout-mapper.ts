import { TrainingSplitExercise } from "training-splits/domain/training-split";

export function createWorkoutExercise(exercise: TrainingSplitExercise) {
	const wikiLinkMatch = exercise.exerciseLink.match(/^\[\[([^\]|]+)(?:\|[^\]]+)?\]\]$/);
	const excerciseName = wikiLinkMatch?.[1]?.trim() || exercise.exerciseLink;

	const prescription = [
		exercise.sets ? `${exercise.sets} sets` : "",
		exercise.reps ? `${exercise.reps} reps` : "",
		...exercise.extraFields,
	].filter(Boolean).join(" | ");

	return {
		exerciseName: excerciseName,
		sets: Number(exercise.sets) || 0,
		prescription: prescription,
	};
}
