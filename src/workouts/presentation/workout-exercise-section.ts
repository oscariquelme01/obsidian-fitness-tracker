import { WorkoutExercise } from "../domain/workout";
import { renderWorkoutSetRow } from "./workout-set-row";

export interface WorkoutExerciseSectionOptions {
	container: HTMLElement;
	exercise: WorkoutExercise;
	exerciseIndex: number;
	isDragging: boolean;
	onChange: () => void;
	onRenderRequired: () => void;
	onRemove: () => void;
	onDragStart: (exerciseIndex: number) => void;
	onDragEnter: (exerciseIndex: number) => void;
	onDragEnd: () => void;
}

export function renderWorkoutExerciseSection(options: WorkoutExerciseSectionOptions): void {
	const section = options.container.createDiv({ cls: "fitness-tracker-exercise" });
	section.draggable = options.isDragging;
	section.addEventListener("dragstart", (event) => {
		if (!options.isDragging) {
			event.preventDefault();
			return;
		}

		event.dataTransfer?.setData("text/plain", String(options.exerciseIndex));
		options.onDragStart(options.exerciseIndex);
	});
	section.addEventListener("dragenter", (event) => {
		event.preventDefault();
		options.onDragEnter(options.exerciseIndex);
	});
	section.addEventListener("dragover", (event) => event.preventDefault());
	section.addEventListener("dragend", options.onDragEnd);

	const heading = section.createDiv({ cls: "fitness-tracker-exercise-header" });
	const dragHandle = heading.createEl("button", { cls: "fitness-tracker-exercise-handle", text: "⋮⋮" });
	dragHandle.addEventListener("pointerdown", () => options.onDragStart(options.exerciseIndex));

	const titleGroup = heading.createDiv({ cls: "fitness-tracker-exercise-title-group" });
	const exerciseInput = titleGroup.createEl("input", {
		cls: "fitness-tracker-exercise-name",
		type: "text",
		value: options.exercise.exerciseName,
	});

	exerciseInput.addEventListener("change", () => {
		options.exercise.exerciseName = exerciseInput.value.trim() || "Exercise name";
		options.onChange();
	});

	titleGroup.createDiv({ cls: "fitness-tracker-exercise-summary", text: createExerciseSummary(options.exercise) });

	const removeExerciseButton = heading.createEl("button", { cls: "fitness-tracker-exercise-menu", text: "⋮" });
	removeExerciseButton.addEventListener("click", options.onRemove);

	const details = section.createDiv({ cls: "fitness-tracker-exercise-details" });

	renderTextField(details, "Prescription", options.exercise.prescription, (value) => {
		options.exercise.prescription = value;
		options.onChange();
	});

	const setsContainer = details.createDiv({ cls: "fitness-tracker-set-list" });
	const setHeader = setsContainer.createDiv({ cls: "fitness-tracker-set-header" });
	setHeader.createSpan({ text: "Set" });
	setHeader.createSpan({ text: "Previous" });
	setHeader.createSpan({ text: "KG" });
	setHeader.createSpan({ text: "Reps" });
	setHeader.createSpan({ text: "" });
	setHeader.createSpan({ text: "" });

	options.exercise.sets.forEach((set, setIndex) => {
		renderWorkoutSetRow({
			container: setsContainer,
			set,
			setIndex,
			onChange: options.onChange,
			onRemove: () => {
				options.exercise.sets.splice(setIndex, 1);
				options.onRenderRequired();
			},
		});
	});

	const addSetButton = details.createEl("button", { cls: "fitness-tracker-add-set", text: "⊕" });
	addSetButton.addEventListener("click", () => {
		options.exercise.sets.push({ completed: false, weight: "", reps: "", rpe: "", notes: "" });
		options.onRenderRequired();
	});

	renderTextField(details, "Notes", options.exercise.notes, (value) => {
		options.exercise.notes = value;
		options.onChange();
	});
}

function renderTextField(
	container: HTMLElement,
	label: string,
	value: string,
	onChange: (value: string) => void,
): void {
	const wrapper = container.createDiv({ cls: value ? "fitness-tracker-field has-value" : "fitness-tracker-field" });
	wrapper.createEl("label", { text: label });
	const input = wrapper.createEl("input", { type: "text", value });

	input.addEventListener("change", () => {
		onChange(input.value.trim());
	});
}

function createExerciseSummary(exercise: WorkoutExercise): string {
	return exercise.prescription || `${exercise.sets.length} sets`;
}
