export interface CreateWorkoutLogDto {
	path: string;
	markdown: string;
}

export interface CreateWorkoutLogResultDto {
	path: string;
	basename: string;
	created?: boolean;
}
