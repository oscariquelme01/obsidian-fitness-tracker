export interface WorkoutLog {
	frontmatter: WorkoutLogFrontmatter;
	title: string;
	sourceTrainingSplit: string;
	exercises: WorkoutLogExerciseEntry[];
}

export interface WorkoutLogFrontmatter {
	fitnessType: string;
	workoutDate: string;
	sourceTrainingSplit: string;
	scheduledDay: string;
}

export interface WorkoutLogExerciseEntry {
	exerciseLink: string;
	prescription: string;
	notes: string;
	sets: WorkoutLogSetEntry[];
}

export interface WorkoutLogSetEntry {
	completed: boolean;
	weight: string;
	reps: string;
	rpe: string;
	notes: string;
}

export interface WorkoutLogFileRef {
	path: string;
	basename: string;
	created?: boolean;
}
