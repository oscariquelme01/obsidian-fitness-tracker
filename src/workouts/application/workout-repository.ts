import { Workout } from "../domain/workout";
import { CreateWorkoutDto, CreateWorkoutResultDto } from "./workout-dtos";

export interface WorkoutRepository {
	getByPath(path: string): Promise<Workout | null>;
	save(path: string, workout: Workout): Promise<void>;
	getByDate(date: Date): Promise<CreateWorkoutResultDto | null>;
	create(dto: CreateWorkoutDto): Promise<CreateWorkoutResultDto>;
	list(): Promise<CreateWorkoutResultDto[]>;
}
