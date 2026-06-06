import { TrainingSplit } from "../domain/training-split";
import { CreateTrainingSplitDto, CreateTrainingSplitResultDto } from "./training-split-dtos";

export interface TrainingSplitRepository {
	getLatestFile(): Promise<CreateTrainingSplitResultDto | null>;
	getByPath(path: string): Promise<TrainingSplit | null>;
	save(path: string, split: TrainingSplit): Promise<void>;
	create(dto: CreateTrainingSplitDto): Promise<CreateTrainingSplitResultDto>;
}
