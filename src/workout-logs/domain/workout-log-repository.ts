import { WorkoutLog, WorkoutLogFileRef } from "./workout-log";

export interface WorkoutLogRepository {
	getByPath(path: string): Promise<WorkoutLog | null>;
	save(path: string, workoutLog: WorkoutLog): Promise<void>;
	getByDate(date: Date): Promise<WorkoutLogFileRef | null>;
	createFromMarkdown(path: string, markdown: string): Promise<WorkoutLogFileRef>;
	list(): Promise<WorkoutLogFileRef[]>;
}
