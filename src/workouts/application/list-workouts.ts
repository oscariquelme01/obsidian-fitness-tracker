import { WorkoutFileDto } from "./workout-dtos";
import { WorkoutRepository } from "./workout-repository";

export async function listWorkouts(repository: WorkoutRepository): Promise<WorkoutFileDto[]> {
	return repository.list();
}
