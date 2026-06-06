import { ParsedTrainingSplitDayResult, TrainingSplit, TrainingSplitFileRef } from "./training-split";

export interface TrainingSplitRepository {
	getLatestFile(): Promise<TrainingSplitFileRef | null>;
	getByPath(path: string): Promise<TrainingSplit | null>;
	save(path: string, split: TrainingSplit): Promise<void>;
	create(date: Date): Promise<TrainingSplitFileRef>;
	getDayFromLatestSplit(day: string): Promise<ParsedTrainingSplitDayResult | null>;
}
