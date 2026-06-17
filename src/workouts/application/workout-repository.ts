import { Workout } from "../domain/workout";
import { CreateWorkoutDto, WorkoutFileDto } from "./workout-dtos";

export interface WorkoutRepository {
	getByPath(path: string): Promise<Workout | null>;
	save(path: string, workout: Workout): Promise<void>;
	getByDate(date: Date): Promise<WorkoutFileDto | null>;
	create(dto: CreateWorkoutDto): Promise<WorkoutFileDto>;
	list(): Promise<WorkoutFileDto[]>;
}
