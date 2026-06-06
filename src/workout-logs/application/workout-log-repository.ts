import { WorkoutLog } from "../domain/workout-log";
import { CreateWorkoutLogDto, CreateWorkoutLogResultDto } from "./workout-log-dtos";

export interface WorkoutLogRepository {
	getByPath(path: string): Promise<WorkoutLog | null>;
	save(path: string, workoutLog: WorkoutLog): Promise<void>;
	getByDate(date: Date): Promise<CreateWorkoutLogResultDto | null>;
	create(dto: CreateWorkoutLogDto): Promise<CreateWorkoutLogResultDto>;
	list(): Promise<CreateWorkoutLogResultDto[]>;
}
