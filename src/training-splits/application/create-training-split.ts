import { CreateTrainingSplitDto, CreateTrainingSplitResultDto } from "./training-split-dtos";
import { TrainingSplitRepository } from "./training-split-repository";

export async function createTrainingSplit(
	repository: TrainingSplitRepository,
	dto: CreateTrainingSplitDto,
): Promise<CreateTrainingSplitResultDto> {
	return repository.create(dto);
}
