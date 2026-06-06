import { CreateExerciseDto, CreateExerciseResultDto } from "./exercise-dtos";
import { ExerciseRepository } from "./exercise-repository";

export async function createExercise(
	repository: ExerciseRepository,
	dto: CreateExerciseDto,
): Promise<CreateExerciseResultDto> {
	return repository.create(dto);
}
