import { CreateWorkoutResultDto } from "./workout-dtos";
import { WorkoutRepository } from "./workout-repository";

export async function listWorkouts(repository: WorkoutRepository): Promise<CreateWorkoutResultDto[]> {
	return repository.list();
}
