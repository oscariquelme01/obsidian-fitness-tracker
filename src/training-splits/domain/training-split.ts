export interface TrainingSplit {
	frontmatter: Record<string, string>;
	title: string;
	days: TrainingSplitDay[];
}

export interface TrainingSplitDay {
	day: string;
	title: string;
	exercises: TrainingSplitExercise[];
}

export interface TrainingSplitExercise {
	exerciseLink: string;
	sets: string;
	reps: string;
	extraFields: string[];
}

export interface ParsedTrainingSplitDay {
	day: string;
	heading: string;
	title: string | null;
	exercises: ParsedTrainingSplitExercise[];
}

export interface ParsedTrainingSplitExercise {
	lineNumber: number;
	exerciseLink: string;
	exerciseName: string;
	sets: number;
	reps: string | null;
	prescription: string;
}

export interface TrainingSplitParseWarning {
	lineNumber: number;
	message: string;
}

export interface ParsedTrainingSplitDayResult {
	day: ParsedTrainingSplitDay | null;
	warnings: TrainingSplitParseWarning[];
}

export interface TrainingSplitFileRef {
	path: string;
	basename: string;
	created: boolean;
}
