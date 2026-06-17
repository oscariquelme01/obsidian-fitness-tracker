import { getPlugin } from "shared/infrastructure/plugin-context";
import { createExerciseFileName, createExerciseNoteContent } from "exercises/infrastructure/markdown/exercise-markdown-template";
import { promptForExercise } from "exercises/presentation/exercise-modal";
import { Notice, normalizePath, TextFileView, TFile, WorkspaceLeaf } from "obsidian";
import { ensureFolder } from "shared/infrastructure/obsidian-file-system";
import { parseTrainingSplit } from "../infrastructure/markdown/training-split-markdown-parser";
import { serializeTrainingSplit } from "../infrastructure/markdown/training-split-markdown-serializer";
import {
	TrainingSplit,
	TrainingSplitDay,
	TrainingSplitExercise,
} from "../domain/training-split";

export const TRAINING_SPLIT_VIEW_TYPE = "fitness-training-split";

export class TrainingSplitView extends TextFileView {
	private split: TrainingSplit | null = null;
	private rawData = "";
	private exerciseLinks: string[] = [];

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return TRAINING_SPLIT_VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.file?.basename || "Training split";
	}

	getIcon(): string {
		return "calendar-days";
	}

	getViewData(): string {
		return this.split ? serializeTrainingSplit(this.split) : this.rawData;
	}

	setViewData(data: string, clear: boolean): void {
		this.rawData = data;
		this.split = parseTrainingSplit(data);
		this.exerciseLinks = getExerciseLinks();

		if (clear) {
			this.contentEl.empty();
		}

		this.render();
	}

	clear(): void {
		this.split = null;
		this.rawData = "";
		this.exerciseLinks = [];
		this.contentEl.empty();
	}

	private render(): void {
		this.contentEl.empty();
		this.contentEl.addClass("fitness-tracker-training-split-view");

		if (!this.split) {
			this.contentEl.createEl("p", { text: "No training split loaded." });
			return;
		}

		const header = this.contentEl.createDiv({ cls: "fitness-tracker-workout-header" });
		header.createEl("h1", { text: this.split.title });
		header.createEl("p", { text: "Edit the Markdown-backed weekly template." });

		const dayList = this.contentEl.createDiv({ cls: "fitness-tracker-training-day-list" });
		this.split.days.forEach((day, dayIndex) => this.renderDay(dayList, day, dayIndex));
	}

	private renderDay(container: HTMLElement, day: TrainingSplitDay, dayIndex: number): void {
		const section = container.createDiv({ cls: "fitness-tracker-training-day" });
		const heading = section.createDiv({ cls: "fitness-tracker-training-day-heading" });
		heading.createEl("h2", { text: day.day });

		const titleInput = heading.createEl("input", {
			type: "text",
			placeholder: "Workout title",
			value: day.title,
		});
		titleInput.addEventListener("change", () => {
			day.title = titleInput.value.trim();
			this.saveOnly();
		});

		const deleteDayButton = heading.createEl("button", { text: "Delete day" });
		deleteDayButton.addEventListener("click", () => {
			this.split?.days.splice(dayIndex, 1);
			this.saveAndRender();
		});

		const exercises = section.createDiv({ cls: "fitness-tracker-training-exercise-list" });
		day.exercises.forEach((exercise, exerciseIndex) => {
			this.renderExercise(exercises, day, exercise, exerciseIndex);
		});

		const actions = section.createDiv({ cls: "fitness-tracker-training-day-actions" });
		const addExerciseButton = actions.createEl("button", { text: "Add exercise" });
		addExerciseButton.addEventListener("click", () => {
			day.exercises.push({ exerciseName: parseExerciseName(this.exerciseLinks[0] || "Exercise name"), sets: "3", reps: "8-12", extraFields: [] });
			this.saveAndRender();
		});

		const createExerciseButton = actions.createEl("button", { text: "New exercise" });
		createExerciseButton.addEventListener("click", () => {
			void this.createExerciseAndAddToDay(day);
		});
	}

	private renderExercise(
		container: HTMLElement,
		day: TrainingSplitDay,
		exercise: TrainingSplitExercise,
		exerciseIndex: number,
	): void {
		const row = container.createDiv({ cls: "fitness-tracker-training-exercise" });
		const select = row.createEl("select");
		const selectedExerciseLink = `[[${exercise.exerciseName}]]`;
		const options = this.exerciseLinks.includes(selectedExerciseLink)
			? this.exerciseLinks
			: [selectedExerciseLink, ...this.exerciseLinks];

		options.forEach((exerciseLink) => {
			const option = select.createEl("option", { text: exerciseLink, value: exerciseLink });

			if (exerciseLink === selectedExerciseLink) {
				option.selected = true;
			}
		});

		select.addEventListener("change", () => {
			exercise.exerciseName = parseExerciseName(select.value);
			this.saveOnly();
		});

		this.renderInput(row, "Sets", exercise.sets, (value) => {
			exercise.sets = value;
		});

		this.renderInput(row, "Reps", exercise.reps, (value) => {
			exercise.reps = value;
		});

		const removeButton = row.createEl("button", { text: "Remove" });
		removeButton.addEventListener("click", () => {
			day.exercises.splice(exerciseIndex, 1);
			this.saveAndRender();
		});
	}

	private renderInput(
		container: HTMLElement,
		placeholder: string,
		value: string,
		onChange: (value: string) => void,
	): void {
		const input = container.createEl("input", { type: "text", placeholder, value });

		input.addEventListener("change", () => {
			onChange(input.value.trim());
			this.saveOnly();
		});
	}

	private async createExerciseAndAddToDay(day: TrainingSplitDay): Promise<void> {
		const result = await promptForExercise(this.app);

		if (!result) {
			return;
		}

		try {
			const plugin = getPlugin();
			const exerciseFolder = normalizePath(plugin.settings.exerciseLibraryFolder);
			await ensureFolder(exerciseFolder);

			const fileName = createExerciseFileName(result.name);
			const exercisePath = normalizePath(`${exerciseFolder}/${fileName}.md`);
			const existingFile = plugin.app.vault.getAbstractFileByPath(exercisePath);

			if (existingFile && !(existingFile instanceof TFile)) {
				new Notice(`Cannot create exercise. Path already exists: ${exercisePath}`);
				return;
			}

			if (!existingFile) {
				await plugin.app.vault.create(
					exercisePath,
					createExerciseNoteContent({
						name: result.name,
						primaryMuscles: result.primaryMuscles,
						equipment: result.equipment,
					}),
				);
			}

			day.exercises.push({ exerciseName: fileName, sets: "3", reps: "8-12", extraFields: [] });
			this.exerciseLinks = getExerciseLinks();
			this.saveAndRender();
			new Notice(`Added exercise: ${result.name}`);
		} catch (error) {
			console.error(error);
			new Notice("Failed to create exercise");
		}
	}

	private saveAndRender(): void {
		this.saveOnly();
		this.render();
	}

	private saveOnly(): void {
		if (!this.split) {
			new Notice("No training split loaded");
			return;
		}

		this.rawData = serializeTrainingSplit(this.split);
		this.requestSave();
	}
}

function getExerciseLinks(): string[] {
	const plugin = getPlugin();
	const exerciseFolder = normalizePath(plugin.settings.exerciseLibraryFolder);

	return plugin.app.vault.getFiles()
		.filter((file) => file.parent?.path === exerciseFolder)
		.map((file) => `[[${file.basename}]]`)
		.sort((left, right) => left.localeCompare(right));
}

function parseExerciseName(value: string): string {
	const wikiLinkMatch = value.match(/^\[\[([^\]|]+)(?:\|[^\]]+)?\]\]$/);

	return wikiLinkMatch?.[1]?.trim() || value;
}
