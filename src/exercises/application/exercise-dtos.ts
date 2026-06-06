import { Exercise } from "../domain/exercise";

export interface CreateExerciseDto {
	name: string;
	primaryMuscles?: string[];
	equipment?: string[];
}

export interface CreateExerciseResultDto {
	exercise: Exercise;
	created: boolean;
}
