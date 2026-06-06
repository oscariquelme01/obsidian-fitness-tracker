import { Exercise } from "../domain/exercise";
import { ExerciseRepository } from "./exercise-repository";

export async function listExercises(repository: ExerciseRepository): Promise<Exercise[]> {
	return repository.list();
}
