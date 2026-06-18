export interface Workout {
	date: string;
	title: string;
	sourceTrainingSplit: string;
	exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
	exerciseName: string;
	prescription: string;
	notes: string;
	sets: WorkoutSet[];
}

export interface WorkoutSet {
	completed: boolean;
	type?: WorkoutSetType;
	weight: string;
	reps: string;
	rpe: string;
	notes: string;
}

export type WorkoutSetType = "failure" | "normal" | "warmup";
