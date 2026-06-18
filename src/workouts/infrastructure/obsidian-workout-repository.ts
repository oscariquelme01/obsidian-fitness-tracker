import { App, normalizePath, TFile } from "obsidian";
import { FitnessTrackerSettings } from "settings/settings";
import { ensureFolder } from "shared/infrastructure/obsidian-file-system";
import { formatDate } from "shared/domain/dates";
import { slugify } from "shared/domain/strings";
import { WorkoutRepository } from "../application/workout-repository";
import { Workout } from "../domain/workout";
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

	async getByDate(date: Date): Promise<Workout | null> {
		const file = this.getFileByDate(date);

		return file ? parseWorkout(await this.app.vault.read(file)) : null;
	}

	async create(workout: Workout): Promise<void> {
		const workoutFolder = normalizePath(this.settings.workoutLogFolder);
		await ensureFolder(workoutFolder);

		const normalizedPath = normalizePath(`${workoutFolder}/${workout.date}-${slugify(workout.title)}.md`);

		const existingFile = this.app.vault.getAbstractFileByPath(normalizedPath);

		if (existingFile instanceof TFile) {
			return;
		}

		if (existingFile) {
			throw new Error(`Cannot create workout. Path already exists: ${normalizedPath}`);
		}

		await this.app.vault.create(normalizedPath, serializeWorkout(workout));
	}

	async list(): Promise<Workout[]> {
		const workoutFolder = normalizePath(this.settings.workoutLogFolder);
		const files = this.app.vault.getFiles()
			.filter((file) => file.parent?.path === workoutFolder);

		return Promise.all(files.map(async (file) => parseWorkout(await this.app.vault.read(file))));
	}

	getFileByDate(date: Date): TFile | null {
		const datePrefix = formatDate(date);
		const workoutFolder = normalizePath(this.settings.workoutLogFolder);

		return this.app.vault.getFiles()
			.find((candidate) => candidate.parent?.path === workoutFolder && candidate.basename.startsWith(datePrefix)) ?? null;
	}
}
