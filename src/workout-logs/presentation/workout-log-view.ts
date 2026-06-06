//TODO: review this, this is vibecoded. For v1 is fine.

import { Notice, TextFileView, WorkspaceLeaf } from "obsidian";
import { parseWorkoutLog } from "../infrastructure/markdown/workout-log-markdown-parser";
import { serializeWorkoutLog } from "../infrastructure/markdown/workout-log-markdown-serializer";
import {
	WorkoutLog,
	WorkoutLogExerciseEntry,
	WorkoutLogSetEntry,
} from "../domain/workout-log";

export const WORKOUT_LOG_VIEW_TYPE = "fitness-workout-log";

const RPE_OPTIONS = ["", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"];

export class WorkoutLogView extends TextFileView {
	private workoutLog: WorkoutLog | null = null;
	private rawData = "";

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return WORKOUT_LOG_VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.file?.basename || "Workout log";
	}

	getIcon(): string {
		return "calendar-check";
	}

	getViewData(): string {
		return this.workoutLog ? serializeWorkoutLog(this.workoutLog) : this.rawData;
	}

	setViewData(data: string, clear: boolean): void {
		this.rawData = data;
		this.workoutLog = parseWorkoutLog(data);

		if (clear) {
			this.contentEl.empty();
		}

		this.render();
	}

	clear(): void {
		this.workoutLog = null;
		this.rawData = "";
		this.contentEl.empty();
	}

	private render(): void {
		this.contentEl.empty();
		this.contentEl.addClass("fitness-tracker-workout-log-view");

		if (!this.workoutLog) {
			this.contentEl.createEl("p", { text: "No workout log loaded." });
			return;
		}

		const header = this.contentEl.createDiv({ cls: "fitness-tracker-workout-header" });
		header.createEl("h1", { text: this.workoutLog.title });
		header.createEl("p", { text: `${this.workoutLog.frontmatter.scheduledDay} · ${this.workoutLog.frontmatter.workoutDate}` });

		const exerciseList = this.contentEl.createDiv({ cls: "fitness-tracker-exercise-list" });

		this.workoutLog.exercises.forEach((exercise, exerciseIndex) => {
			this.renderExercise(exerciseList, exercise, exerciseIndex);
		});

		const addExerciseButton = this.contentEl.createEl("button", { text: "Add exercise" });
		addExerciseButton.addEventListener("click", () => {
			this.workoutLog?.exercises.push({
				exerciseLink: "[[Exercise name]]",
				prescription: "",
				notes: "",
				sets: [{ completed: false, weight: "", reps: "", rpe: "", notes: "" }],
			});
			this.saveAndRender();
		});
	}

	private renderExercise(container: HTMLElement, exercise: WorkoutLogExerciseEntry, exerciseIndex: number): void {
		const section = container.createDiv({ cls: "fitness-tracker-exercise" });
		const heading = section.createDiv({ cls: "fitness-tracker-exercise-heading" });
		const exerciseInput = heading.createEl("input", {
			type: "text",
			value: exercise.exerciseLink,
		});

		exerciseInput.addEventListener("change", () => {
			exercise.exerciseLink = exerciseInput.value.trim() || "[[Exercise name]]";
			this.saveOnly();
		});

		const removeExerciseButton = heading.createEl("button", { text: "Remove" });
		removeExerciseButton.addEventListener("click", () => {
			this.workoutLog?.exercises.splice(exerciseIndex, 1);
			this.saveAndRender();
		});

		this.renderTextField(section, "Prescription", exercise.prescription, (value) => {
			exercise.prescription = value;
		});

		this.renderTextField(section, "Notes", exercise.notes, (value) => {
			exercise.notes = value;
		});

		const setsContainer = section.createDiv({ cls: "fitness-tracker-set-list" });
		exercise.sets.forEach((set, setIndex) => {
			this.renderSet(setsContainer, exercise, set, setIndex);
		});

		const addSetButton = section.createEl("button", { text: "Add set" });
		addSetButton.addEventListener("click", () => {
			exercise.sets.push({ completed: false, weight: "", reps: "", rpe: "", notes: "" });
			this.saveAndRender();
		});
	}

	private renderSet(
		container: HTMLElement,
		exercise: WorkoutLogExerciseEntry,
		set: WorkoutLogSetEntry,
		setIndex: number,
	): void {
		const row = container.createDiv({ cls: "fitness-tracker-set" });
		const completedCheckbox = row.createEl("input", { type: "checkbox" });
		completedCheckbox.checked = set.completed;
		completedCheckbox.addEventListener("change", () => {
			set.completed = completedCheckbox.checked;
			this.saveOnly();
		});

		row.createEl("span", { text: `Set ${setIndex + 1}` });

		this.renderInput(row, "Weight", set.weight, (value) => {
			set.weight = value;
		});

		this.renderInput(row, "Reps", set.reps, (value) => {
			set.reps = value;
		});

		const rpeSelect = row.createEl("select");
		RPE_OPTIONS.forEach((rpe) => {
			const option = rpeSelect.createEl("option", { text: rpe || "RPE", value: rpe });

			if (rpe === set.rpe) {
				option.selected = true;
			}
		});
		rpeSelect.addEventListener("change", () => {
			set.rpe = rpeSelect.value;
			this.saveOnly();
		});

		this.renderInput(row, "Notes", set.notes, (value) => {
			set.notes = value;
		});

		const removeSetButton = row.createEl("button", { text: "Remove" });
		removeSetButton.addEventListener("click", () => {
			exercise.sets.splice(setIndex, 1);
			this.saveAndRender();
		});
	}

	private renderTextField(
		container: HTMLElement,
		label: string,
		value: string,
		onChange: (value: string) => void,
	): void {
		const wrapper = container.createDiv({ cls: "fitness-tracker-field" });
		wrapper.createEl("label", { text: label });
		const input = wrapper.createEl("input", { type: "text", value });

		input.addEventListener("change", () => {
			onChange(input.value.trim());
			this.saveOnly();
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

	private saveAndRender(): void {
		this.saveOnly();
		this.render();
	}

	private saveOnly(): void {
		if (!this.workoutLog) {
			new Notice("No workout log loaded");
			return;
		}

		this.rawData = serializeWorkoutLog(this.workoutLog);
		this.requestSave();
	}
}
