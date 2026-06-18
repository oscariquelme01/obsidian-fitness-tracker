import { TrainingSplitRepository } from "training-splits/application/training-split-repository";
import { formatDate } from "shared/domain/dates";
import { getWeekdayName } from "shared/domain/weekdays";
import { CreateWorkoutInputDto, CreateWorkoutResultDto } from "./workout-dtos";
import { WorkoutRepository } from "./workout-repository";
import { Workout } from "../domain/workout";

interface CreateWorkoutDependencies {
	trainingSplitRepository: TrainingSplitRepository;
	workoutRepository: WorkoutRepository;
}

export async function createWorkout(
	input: CreateWorkoutInputDto,
	dependencies: CreateWorkoutDependencies,
): Promise<CreateWorkoutResultDto | null> {
	const existingWorkout = await dependencies.workoutRepository.getByDate(input.date);

	if (existingWorkout) {
		return { workout: existingWorkout, created: false };
	}

	const scheduledDay = getWeekdayName(input.date);
	const latestTrainingSplit = await dependencies.trainingSplitRepository.getLatestFile();

	if (!latestTrainingSplit) {
		return null;
	}

	const trainingSplit = await dependencies.trainingSplitRepository.getByPath(latestTrainingSplit.path);
	const trainingDay = trainingSplit?.days.find((day) => day.day.toLowerCase() === scheduledDay.toLowerCase());

	if (!trainingDay) {
		return null;
	}

	const title = trainingDay.title || `${scheduledDay} workout`;
	const workout: Workout = {
		date: formatDate(input.date),
		title,
		sourceTrainingSplit: latestTrainingSplit.basename,
		exercises: trainingDay.exercises.map((exercise) => {
			const prescription = [
				exercise.sets ? `${exercise.sets} sets` : "",
				exercise.reps ? `${exercise.reps} reps` : "",
				...exercise.extraFields,
			].filter(Boolean).join(" | ");

			return {
				exerciseName: exercise.exerciseName,
				prescription,
				notes: "",
				sets: Array.from({ length: Number(exercise.sets) || 0 }, () => ({
					completed: false,
					weight: "",
					reps: "",
					rpe: "",
					notes: "",
				})),
			};
		}),
	};

	await dependencies.workoutRepository.create(workout);

	return { workout, created: true };
}
