import { App, normalizePath, TFile } from "obsidian";
import { FitnessTrackerSettings } from "settings/settings";
import { ensureFolder, getLatestTrainingSplitFile } from "shared/infrastructure/obsidian-file-system";
import { CreateTrainingSplitDto, CreateTrainingSplitResultDto } from "../application/training-split-dtos";
import { TrainingSplitRepository } from "../application/training-split-repository";
import { TrainingSplit } from "../domain/training-split";
import { parseTrainingSplit } from "./markdown/training-split-markdown-parser";
import { serializeTrainingSplit } from "./markdown/training-split-markdown-serializer";
import { createTrainingSplitFileName, createTrainingSplitNoteContent } from "./markdown/training-split-markdown-template";

export class ObsidianTrainingSplitRepository implements TrainingSplitRepository {
	constructor(
		private readonly app: App,
		private readonly settings: FitnessTrackerSettings,
	) {}

	async getLatestFile(): Promise<CreateTrainingSplitResultDto | null> {
		const file = getLatestTrainingSplitFile();

		return file ? { path: file.path, basename: file.basename, created: false } : null;
	}

	async getByPath(path: string): Promise<TrainingSplit | null> {
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			return null;
		}

		return parseTrainingSplit(await this.app.vault.read(file));
	}

	async save(path: string, split: TrainingSplit): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			throw new Error(`Training split file not found: ${path}`);
		}

		await this.app.vault.modify(file, serializeTrainingSplit(split));
	}

	async create(dto: CreateTrainingSplitDto): Promise<CreateTrainingSplitResultDto> {
		const trainingSplitFolder = normalizePath(this.settings.trainingSplitFolder);
		await ensureFolder(trainingSplitFolder);

		const fileName = createTrainingSplitFileName(dto.date);
		const trainingSplitPath = normalizePath(`${trainingSplitFolder}/${fileName}.md`);
		const existingFile = this.app.vault.getAbstractFileByPath(trainingSplitPath);

		if (existingFile instanceof TFile) {
			return { path: existingFile.path, basename: existingFile.basename, created: false };
		}

		if (existingFile) {
			throw new Error(`Cannot create training split. Path already exists: ${trainingSplitPath}`);
		}

		const file = await this.app.vault.create(trainingSplitPath, createTrainingSplitNoteContent(dto.date));

		return { path: file.path, basename: file.basename, created: true };
	}

}
