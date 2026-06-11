import { WorkoutExercise } from "../domain/workout";
import { renderWorkoutSetRow } from "./workout-set-row";

export interface WorkoutExerciseSectionOptions {
	container: HTMLElement;
	exercise: WorkoutExercise;
	exerciseIndex: number;
	onChange: () => void;
	onRenderRequired: () => void;
	onRemove: () => void;
}

export function renderWorkoutExerciseSection(options: WorkoutExerciseSectionOptions): void {
	const section = options.container.createDiv({ cls: "fitness-tracker-exercise" });
	const heading = section.createDiv({ cls: "fitness-tracker-exercise-heading" });
	const exerciseInput = heading.createEl("input", {
		type: "text",
		value: options.exercise.exerciseName,
	});

	exerciseInput.addEventListener("change", () => {
		options.exercise.exerciseName = exerciseInput.value.trim() || "Exercise name";
		options.onChange();
	});

	const removeExerciseButton = heading.createEl("button", { text: "Remove" });
	removeExerciseButton.addEventListener("click", options.onRemove);

	renderTextField(section, "Prescription", options.exercise.prescription, (value) => {
		options.exercise.prescription = value;
		options.onChange();
	});

	renderTextField(section, "Notes", options.exercise.notes, (value) => {
		options.exercise.notes = value;
		options.onChange();
	});

	const setsContainer = section.createDiv({ cls: "fitness-tracker-set-list" });
	options.exercise.sets.forEach((set, setIndex) => {
		renderWorkoutSetRow({
			container: setsContainer,
			exercise: options.exercise,
			set,
			setIndex,
			onChange: options.onChange,
			onRemove: () => {
				options.exercise.sets.splice(setIndex, 1);
				options.onRenderRequired();
			},
		});
	});

	const addSetButton = section.createEl("button", { text: "Add set" });
	addSetButton.addEventListener("click", () => {
		options.exercise.sets.push({ completed: false, weight: "", reps: "", rpe: "", notes: "" });
		options.onRenderRequired();
	});
}

function renderTextField(
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
	});
}
