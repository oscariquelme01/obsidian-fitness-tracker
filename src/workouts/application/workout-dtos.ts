import type { Workout } from "../domain/workout";

export interface CreateWorkoutInputDto {
	date: Date;
}

export interface CreateWorkoutResultDto {
	workout: Workout;
	created: boolean;
}
