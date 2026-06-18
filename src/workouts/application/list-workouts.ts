import { Workout } from "../domain/workout";
import { WorkoutRepository } from "./workout-repository";

export async function listWorkouts(repository: WorkoutRepository): Promise<Workout[]> {
	return repository.list();
}
