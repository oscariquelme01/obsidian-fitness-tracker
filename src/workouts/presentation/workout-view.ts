//TODO: review this, this is vibecoded. For v1 is fine.

import { Notice, TextFileView, WorkspaceLeaf } from "obsidian";
import { parseWorkout } from "../infrastructure/markdown/workout-markdown-parser";
import { serializeWorkout } from "../infrastructure/markdown/workout-markdown-serializer";
import { Workout } from "../domain/workout";
import { renderWorkoutExerciseSection } from "./workout-exercise-section";

export const WORKOUT_VIEW_TYPE = "fitness-workout";

export class WorkoutView extends TextFileView {
	private workout: Workout | null = null;
	private rawData = "";
	private draggedExerciseIndex: number | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return WORKOUT_VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.file?.basename || "Workout";
	}

	getIcon(): string {
		return "calendar-check";
	}

	getViewData(): string {
		return this.workout ? serializeWorkout(this.workout) : this.rawData;
	}

	setViewData(data: string, clear: boolean): void {
		this.rawData = data;
		this.workout = parseWorkout(data);

		if (clear) {
			this.contentEl.empty();
		}

		this.render();
	}

	clear(): void {
		this.workout = null;
		this.rawData = "";
		this.contentEl.empty();
	}

	private render(): void {
		this.contentEl.empty();
		this.contentEl.addClass("fitness-tracker-workout-view");
		this.contentEl.toggleClass("is-reordering", this.draggedExerciseIndex !== null);

		if (!this.workout) {
			this.contentEl.createEl("p", { text: "No workout loaded." });
			return;
		}

		const header = this.contentEl.createDiv({ cls: "fitness-tracker-workout-header" });
		header.createEl("h1", { text: this.workout.title });
		header.createEl("p", { text: this.workout.date });

		const exerciseList = this.contentEl.createDiv({ cls: "fitness-tracker-exercise-list" });

		this.workout.exercises.forEach((exercise, exerciseIndex) => {
			renderWorkoutExerciseSection({
				container: exerciseList,
				exercise,
				exerciseIndex,
				isDragging: this.draggedExerciseIndex !== null,
				onChange: () => this.saveOnly(),
				onRenderRequired: () => this.saveAndRender(),
				onRemove: () => {
					this.workout?.exercises.splice(exerciseIndex, 1);
					this.saveAndRender();
				},
				onDragStart: (index) => this.startExerciseDrag(index),
				onDragEnter: (index) => this.moveDraggedExercise(index),
				onDragEnd: () => this.endExerciseDrag(),
			});
		});

		const addExerciseButton = this.contentEl.createEl("button", { text: "Add exercise" });
		addExerciseButton.addEventListener("click", () => {
			this.workout?.exercises.push({
				exerciseName: "Exercise name",
				prescription: "",
				notes: "",
				sets: [{ completed: false, weight: "", reps: "", rpe: "", notes: "" }],
			});
			this.saveAndRender();
		});
	}

	private saveAndRender(): void {
		this.saveOnly();
		this.render();
	}

	private startExerciseDrag(exerciseIndex: number): void {
		this.draggedExerciseIndex = exerciseIndex;
		this.render();
	}

	private moveDraggedExercise(targetIndex: number): void {
		if (!this.workout || this.draggedExerciseIndex === null || this.draggedExerciseIndex === targetIndex) {
			return;
		}

		const [exercise] = this.workout.exercises.splice(this.draggedExerciseIndex, 1);

		if (!exercise) {
			return;
		}

		this.workout.exercises.splice(targetIndex, 0, exercise);
		this.draggedExerciseIndex = targetIndex;
		this.saveAndRender();
	}

	private endExerciseDrag(): void {
		this.draggedExerciseIndex = null;
		this.render();
	}

	private saveOnly(): void {
		if (!this.workout) {
			new Notice("No workout loaded");
			return;
		}

		this.rawData = serializeWorkout(this.workout);
		this.requestSave();
	}
}
