import { App, normalizePath, TFile } from "obsidian";
import { FitnessTrackerSettings } from "settings/settings";
import { ensureFolder } from "shared/infrastructure/obsidian-file-system";
import { formatDate } from "shared/domain/dates";
import { CreateWorkoutDto, CreateWorkoutResultDto } from "../application/workout-dtos";
import { WorkoutRepository } from "../application/workout-repository";
import { Workout } from "../domain/workout";
import { createWorkoutNoteContent } from "./markdown/workout-markdown-template";
import { parseWorkout } from "./markdown/workout-markdown-parser";
import { serializeWorkout } from "./markdown/workout-markdown-serializer";

export class ObsidianWorkoutRepository implements WorkoutRepository {
	constructor(
		private readonly app: App,
		private readonly settings: FitnessTrackerSettings,
	) {}

	async getByPath(path: string): Promise<Workout | null> {
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			return null;
		}

		return parseWorkout(await this.app.vault.read(file));
	}

	async save(path: string, workout: Workout): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			throw new Error(`Workout file not found: ${path}`);
		}

		await this.app.vault.modify(file, serializeWorkout(workout));
	}

	async getByDate(date: Date): Promise<CreateWorkoutResultDto | null> {
		const datePrefix = formatDate(date);
		const workoutFolder = normalizePath(this.settings.workoutLogFolder);
		const file = this.app.vault.getFiles()
			.find((candidate) => candidate.parent?.path === workoutFolder && candidate.basename.startsWith(datePrefix));

		return file ? { path: file.path, basename: file.basename, created: false } : null;
	}

	async create(dto: CreateWorkoutDto): Promise<CreateWorkoutResultDto> {
		const workoutFolder = normalizePath(this.settings.workoutLogFolder);
		await ensureFolder(workoutFolder);

		const normalizedPath = normalizePath(`${workoutFolder}/${dto.fileName}.md`);

		const existingFile = this.app.vault.getAbstractFileByPath(normalizedPath);

		if (existingFile instanceof TFile) {
			return { path: existingFile.path, basename: existingFile.basename, created: false };
		}

		if (existingFile) {
			throw new Error(`Cannot create workout. Path already exists: ${normalizedPath}`);
		}

		const file = await this.app.vault.create(
			normalizedPath,
			createWorkoutNoteContent({
				date: dto.date,
				workoutTitle: dto.title,
				sourceTrainingSplitName: dto.sourceTrainingSplitName,
				exercises: dto.exercises,
			}),
		);

		return { path: file.path, basename: file.basename, created: true };
	}

	async list(): Promise<CreateWorkoutResultDto[]> {
		const workoutFolder = normalizePath(this.settings.workoutLogFolder);

		return this.app.vault.getFiles()
			.filter((file) => file.parent?.path === workoutFolder)
			.map((file) => ({ path: file.path, basename: file.basename }));
	}
}
