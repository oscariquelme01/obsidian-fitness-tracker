import { WorkoutLogFileRef } from "../domain/workout-log";
import { WorkoutLogRepository } from "../domain/workout-log-repository";

export async function listWorkoutLogs(repository: WorkoutLogRepository): Promise<WorkoutLogFileRef[]> {
	return repository.list();
}
