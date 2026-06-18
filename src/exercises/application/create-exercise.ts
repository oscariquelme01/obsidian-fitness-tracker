import { Exercise } from "../domain/exercise";
import { CreateExerciseInputDto, CreateExerciseResultDto } from "./exercise-dtos";
import { ExerciseRepository } from "./exercise-repository";

export async function createExercise(
	repository: ExerciseRepository,
	input: CreateExerciseInputDto,
): Promise<CreateExerciseResultDto> {
	const name = input.name.trim();

	if (!name) {
		throw new Error("Exercise name is required");
	}

	const existingExercise = await repository.getByName(name);

	if (existingExercise) {
		return { exercise: existingExercise, created: false };
	}

	const exercise: Exercise = {
		name,
		primaryMuscles: input.primaryMuscles || [],
		equipment: input.equipment || [],
	};

	await repository.create(exercise);

	return { exercise, created: true };
}
