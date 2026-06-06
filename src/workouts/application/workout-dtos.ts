export interface CreateWorkoutDto {
	path: string;
	markdown: string;
}

export interface CreateWorkoutResultDto {
	path: string;
	basename: string;
	created?: boolean;
}
