import { Workout } from "../domain/workout";

export interface WorkoutRepository {
	getByPath(path: string): Promise<Workout | null>;
	save(path: string, workout: Workout): Promise<void>;
	getByDate(date: Date): Promise<Workout | null>;
	create(workout: Workout): Promise<void>;
	list(): Promise<Workout[]>;
}
