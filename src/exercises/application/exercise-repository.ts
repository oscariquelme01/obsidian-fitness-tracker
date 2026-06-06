import { Exercise } from "../domain/exercise";
import { CreateExerciseDto, CreateExerciseResultDto } from "./exercise-dtos";

export interface ExerciseRepository {
	list(): Promise<Exercise[]>;
	create(dto: CreateExerciseDto): Promise<CreateExerciseResultDto>;
	getByName(name: string): Promise<Exercise | null>;
}
