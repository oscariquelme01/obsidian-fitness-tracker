import { App, normalizePath, TFile } from "obsidian";
import { FitnessTrackerSettings } from "settings/settings";
import { ensureFolder } from "shared/infrastructure/obsidian-file-system";
import { formatDate } from "shared/domain/dates";
import { CreateWorkoutLogDto, CreateWorkoutLogResultDto } from "../application/workout-log-dtos";
import { WorkoutLogRepository } from "../application/workout-log-repository";
import { WorkoutLog } from "../domain/workout-log";
import { parseWorkoutLog } from "./markdown/workout-log-markdown-parser";
import { serializeWorkoutLog } from "./markdown/workout-log-markdown-serializer";

export class ObsidianWorkoutLogRepository implements WorkoutLogRepository {
	constructor(
		private readonly app: App,
		private readonly settings: FitnessTrackerSettings,
	) {}

	async getByPath(path: string): Promise<WorkoutLog | null> {
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			return null;
		}

		return parseWorkoutLog(await this.app.vault.read(file));
	}

	async save(path: string, workoutLog: WorkoutLog): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			throw new Error(`Workout log file not found: ${path}`);
		}

		await this.app.vault.modify(file, serializeWorkoutLog(workoutLog));
	}

	async getByDate(date: Date): Promise<CreateWorkoutLogResultDto | null> {
		const datePrefix = formatDate(date);
		const workoutLogFolder = normalizePath(this.settings.workoutLogFolder);
		const file = this.app.vault.getFiles()
			.find((candidate) => candidate.parent?.path === workoutLogFolder && candidate.basename.startsWith(datePrefix));

		return file ? { path: file.path, basename: file.basename, created: false } : null;
	}

	async create(dto: CreateWorkoutLogDto): Promise<CreateWorkoutLogResultDto> {
		const normalizedPath = normalizePath(dto.path);
		const folderPath = normalizedPath.slice(0, normalizedPath.lastIndexOf("/"));

		if (folderPath) {
			await ensureFolder(folderPath);
		}

		const existingFile = this.app.vault.getAbstractFileByPath(normalizedPath);

		if (existingFile instanceof TFile) {
			return { path: existingFile.path, basename: existingFile.basename, created: false };
		}

		if (existingFile) {
			throw new Error(`Cannot create workout log. Path already exists: ${normalizedPath}`);
		}

		const file = await this.app.vault.create(normalizedPath, dto.markdown);

		return { path: file.path, basename: file.basename, created: true };
	}

	async list(): Promise<CreateWorkoutLogResultDto[]> {
		const workoutLogFolder = normalizePath(this.settings.workoutLogFolder);

		return this.app.vault.getFiles()
			.filter((file) => file.parent?.path === workoutLogFolder)
			.map((file) => ({ path: file.path, basename: file.basename }));
	}
}
