import { Exercise } from "../domain/exercise";

export interface ExerciseRepository {
	list(): Promise<Exercise[]>;
	create(exercise: Exercise): Promise<void>;
	getByName(name: string): Promise<Exercise | null>;
}
