import { CreateWorkoutLogResultDto } from "./workout-log-dtos";
import { WorkoutLogRepository } from "./workout-log-repository";

export async function listWorkoutLogs(repository: WorkoutLogRepository): Promise<CreateWorkoutLogResultDto[]> {
	return repository.list();
}
