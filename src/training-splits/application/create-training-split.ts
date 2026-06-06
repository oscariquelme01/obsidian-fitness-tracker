import { TrainingSplitFileRef } from "../domain/training-split";
import { TrainingSplitRepository } from "../domain/training-split-repository";

export async function createTrainingSplit(
	repository: TrainingSplitRepository,
	date: Date,
): Promise<TrainingSplitFileRef> {
	return repository.create(date);
}
