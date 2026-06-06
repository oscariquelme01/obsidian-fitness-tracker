import { App, normalizePath, TFile } from "obsidian";
import { FitnessTrackerSettings } from "settings/settings";
import { ensureFolder } from "shared/infrastructure/obsidian-file-system";
import { TrainingSplit, TrainingSplitFileRef } from "../domain/training-split";
import { TrainingSplitRepository } from "../domain/training-split-repository";
import { parseTrainingSplit, parseTrainingSplitDay } from "./markdown/training-split-markdown-parser";
import { serializeTrainingSplit } from "./markdown/training-split-markdown-serializer";
import { createTrainingSplitFileName, createTrainingSplitNoteContent } from "./markdown/training-split-markdown-template";

export class ObsidianTrainingSplitRepository implements TrainingSplitRepository {
	constructor(
		private readonly app: App,
		private readonly settings: FitnessTrackerSettings,
	) {}

	async getLatestFile(): Promise<TrainingSplitFileRef | null> {
		const file = this.getLatestTrainingSplitFile();

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

	async create(date: Date): Promise<TrainingSplitFileRef> {
		const trainingSplitFolder = normalizePath(this.settings.trainingSplitFolder);
		await ensureFolder(trainingSplitFolder);

		const fileName = createTrainingSplitFileName(date);
		const trainingSplitPath = normalizePath(`${trainingSplitFolder}/${fileName}.md`);
		const existingFile = this.app.vault.getAbstractFileByPath(trainingSplitPath);

		if (existingFile instanceof TFile) {
			return { path: existingFile.path, basename: existingFile.basename, created: false };
		}

		if (existingFile) {
			throw new Error(`Cannot create training split. Path already exists: ${trainingSplitPath}`);
		}

		const file = await this.app.vault.create(trainingSplitPath, createTrainingSplitNoteContent(date));

		return { path: file.path, basename: file.basename, created: true };
	}

	async getDayFromLatestSplit(day: string) {
		const file = this.getLatestTrainingSplitFile();

		if (!file) {
			return null;
		}

		return parseTrainingSplitDay(await this.app.vault.read(file), day);
	}

	private getLatestTrainingSplitFile(): TFile | null {
		const trainingSplitFolder = normalizePath(this.settings.trainingSplitFolder);
		const trainingSplitFiles = this.app.vault.getFiles()
			.filter((file) => file.parent?.path === trainingSplitFolder)
			.filter((file) => /^Training-\d{4}-\d{2}-\d{2}$/.test(file.basename));

		return trainingSplitFiles.sort((left, right) => right.basename.localeCompare(left.basename))[0] || null;
	}
}
