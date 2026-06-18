import { App, normalizePath, TFile } from "obsidian";
import { FitnessTrackerSettings } from "settings/settings";
import { ensureFolder } from "shared/infrastructure/obsidian-file-system";
import { ExerciseRepository } from "../application/exercise-repository";
import { Exercise } from "../domain/exercise";
import { parseExerciseFromMarkdownFile } from "./markdown/exercise-markdown-parser";
import { createExerciseFileName, createExerciseNoteContent } from "./markdown/exercise-markdown-template";

export class ObsidianExerciseRepository implements ExerciseRepository {
	constructor(
		private readonly app: App,
		private readonly settings: FitnessTrackerSettings,
	) {}

	async list(): Promise<Exercise[]> {
		const exerciseFolder = normalizePath(this.settings.exerciseLibraryFolder);

		return this.app.vault.getFiles()
			.filter((file) => file.parent?.path === exerciseFolder)
			.map((file) => this.loadExerciseFromFile(file));
	}

	async create(exercise: Exercise): Promise<void> {
		const exerciseFolder = normalizePath(this.settings.exerciseLibraryFolder);
		await ensureFolder(exerciseFolder);

		const fileName = createExerciseFileName(exercise.name);
		const exercisePath = normalizePath(`${exerciseFolder}/${fileName}.md`);
		const existingFile = this.app.vault.getAbstractFileByPath(exercisePath);

		if (existingFile instanceof TFile) {
			return;
		}

		if (existingFile) {
			throw new Error(`Cannot create exercise. Path already exists: ${exercisePath}`);
		}

		await this.app.vault.create(exercisePath, createExerciseNoteContent(exercise));
	}

	async getByName(name: string): Promise<Exercise | null> {
		const fileName = createExerciseFileName(name);
		const exerciseFolder = normalizePath(this.settings.exerciseLibraryFolder);
		const exercisePath = normalizePath(`${exerciseFolder}/${fileName}.md`);
		const file = this.app.vault.getAbstractFileByPath(exercisePath);

		if (!(file instanceof TFile)) {
			return null;
		}

		return this.loadExerciseFromFile(file);
	}

	private loadExerciseFromFile(file: TFile): Exercise {
		const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter;

		return parseExerciseFromMarkdownFile({ basename: file.basename, frontmatter });
	}
}
