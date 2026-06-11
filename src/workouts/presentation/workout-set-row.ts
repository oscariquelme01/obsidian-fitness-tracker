import { WorkoutExercise, WorkoutSet } from "../domain/workout";

const RPE_OPTIONS = ["", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"];

export interface WorkoutSetRowOptions {
	container: HTMLElement;
	exercise: WorkoutExercise;
	set: WorkoutSet;
	setIndex: number;
	onChange: () => void;
	onRemove: () => void;
}

export function renderWorkoutSetRow(options: WorkoutSetRowOptions): void {
	const row = options.container.createDiv({ cls: "fitness-tracker-set" });
	const completedCheckbox = row.createEl("input", { type: "checkbox" });
	completedCheckbox.checked = options.set.completed;
	completedCheckbox.addEventListener("change", () => {
		options.set.completed = completedCheckbox.checked;
		options.onChange();
	});

	row.createEl("span", { text: `Set ${options.setIndex + 1}` });

	renderInput(row, "Weight", options.set.weight, (value) => {
		options.set.weight = value;
		options.onChange();
	});

	renderInput(row, "Reps", options.set.reps, (value) => {
		options.set.reps = value;
		options.onChange();
	});

	const rpeSelect = row.createEl("select");
	RPE_OPTIONS.forEach((rpe) => {
		const option = rpeSelect.createEl("option", { text: rpe || "RPE", value: rpe });

		if (rpe === options.set.rpe) {
			option.selected = true;
		}
	});
	rpeSelect.addEventListener("change", () => {
		options.set.rpe = rpeSelect.value;
		options.onChange();
	});

	renderInput(row, "Notes", options.set.notes, (value) => {
		options.set.notes = value;
		options.onChange();
	});

	const removeSetButton = row.createEl("button", { text: "Remove" });
	removeSetButton.addEventListener("click", options.onRemove);
}

function renderInput(
	container: HTMLElement,
	placeholder: string,
	value: string,
	onChange: (value: string) => void,
): void {
	const input = container.createEl("input", { type: "text", placeholder, value });

	input.addEventListener("change", () => {
		onChange(input.value.trim());
	});
}
