import { TrainingSplitRepository } from "training-splits/application/training-split-repository";
import { formatDate } from "shared/domain/dates";
import { getWeekdayName } from "shared/domain/weekdays";
import { slugify } from "shared/domain/strings";
import { CreateWorkoutCommandDto, CreateWorkoutResultDto } from "./workout-dtos";
import { WorkoutRepository } from "./workout-repository";

interface CreateWorkoutDependencies {
	trainingSplitRepository: TrainingSplitRepository;
	workoutRepository: WorkoutRepository;
}

export async function createWorkout(
	command: CreateWorkoutCommandDto,
	dependencies: CreateWorkoutDependencies,
): Promise<CreateWorkoutResultDto | null> {
	const existingWorkout = await dependencies.workoutRepository.getByDate(command.date);

	if (existingWorkout) {
		return existingWorkout;
	}

	const scheduledDay = getWeekdayName(command.date);
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

	return dependencies.workoutRepository.create({
		date: command.date,
		title,
		fileName: `${formatDate(command.date)}-${slugify(title)}`,
		sourceTrainingSplitName: latestTrainingSplit.basename,
		exercises: trainingDay.exercises.map((exercise) => {
			const prescription = [
				exercise.sets ? `${exercise.sets} sets` : "",
				exercise.reps ? `${exercise.reps} reps` : "",
				...exercise.extraFields,
			].filter(Boolean).join(" | ");

			return {
				exerciseName: exercise.exerciseName,
				sets: Number(exercise.sets) || 0,
				prescription,
			};
		}),
	});
}
