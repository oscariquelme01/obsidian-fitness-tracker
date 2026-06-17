export interface CreateWorkoutCommandDto {
	date: Date;
}

export interface CreateWorkoutDto {
	date: Date;
	title: string;
	fileName: string;
	sourceTrainingSplitName: string;
	exercises: CreateWorkoutExerciseDto[];
}

export interface CreateWorkoutExerciseDto {
	exerciseName: string;
	sets: number;
	prescription: string;
}

export interface WorkoutFileDto {
	path: string;
	basename: string;
	created?: boolean;
}
