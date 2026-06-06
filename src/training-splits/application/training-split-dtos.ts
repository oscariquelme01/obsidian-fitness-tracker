export interface CreateTrainingSplitDto {
	date: Date;
}

export interface CreateTrainingSplitResultDto {
	path: string;
	basename: string;
	created: boolean;
}
