export interface Workout {
	date: string;
	scheduledDay: string;
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
	weight: string;
	reps: string;
	rpe: string;
	notes: string;
}
