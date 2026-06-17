import { WorkoutSet } from "../domain/workout";

const RPE_OPTIONS = ["", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"];

export interface WorkoutSetRowOptions {
	container: HTMLElement;
	set: WorkoutSet;
	setIndex: number;
	onChange: () => void;
	onRemove: () => void;
}

export function renderWorkoutSetRow(options: WorkoutSetRowOptions): void {
	const row = options.container.createDiv({ cls: "fitness-tracker-set-row" });
	row.createDiv({ cls: "fitness-tracker-set-cell fitness-tracker-set-index", text: String(options.setIndex + 1) });

	renderInput(row, "Previous", createPreviousSetText(options.set), (value) => {
		const [reps, weight] = value.split("@");
		options.set.reps = reps?.trim() || options.set.reps;
		options.set.weight = weight?.trim() || options.set.weight;
		options.onChange();
	});

	renderInput(row, "KG", options.set.weight, (value) => {
		options.set.weight = value;
		options.onChange();
	});

	renderInput(row, "Reps", options.set.reps, (value) => {
		options.set.reps = value;
		options.onChange();
	});

	const completedCell = row.createDiv({ cls: "fitness-tracker-set-cell fitness-tracker-set-complete" });
	const completedCheckbox = completedCell.createEl("input", { type: "checkbox" });
	completedCheckbox.checked = options.set.completed;
	completedCheckbox.addEventListener("change", () => {
		options.set.completed = completedCheckbox.checked;
		options.onChange();
	});

	const rpeSelect = row.createEl("select", { cls: "fitness-tracker-set-rpe" });
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

	const removeSetButton = row.createEl("button", { cls: "fitness-tracker-set-remove", text: "×" });
	removeSetButton.addEventListener("click", options.onRemove);
}

function renderInput(
	container: HTMLElement,
	placeholder: string,
	value: string,
	onChange: (value: string) => void,
): void {
	const cell = container.createDiv({ cls: "fitness-tracker-set-cell" });
	const input = cell.createEl("input", { type: "text", placeholder, value });

	input.addEventListener("change", () => {
		onChange(input.value.trim());
	});
}

function createPreviousSetText(set: WorkoutSet): string {
	if (!set.weight && !set.reps) {
		return "";
	}

	return `${set.reps || "?"}@${set.weight || "?"}`;
}
