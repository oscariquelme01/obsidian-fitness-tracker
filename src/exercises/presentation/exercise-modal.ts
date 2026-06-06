import { App, Modal } from "obsidian";
import { createTextInputField } from "shared/presentation/form-fields/text-input-field";

export interface ExerciseModalResult {
	name: string;
	primaryMuscles: string[];
	equipment: string[];
}

export class ExerciseModal extends Modal {
	private nameInputEl: HTMLInputElement | null = null;
	private musclesInputEl: HTMLInputElement | null = null;
	private equipmentInputEl: HTMLInputElement | null = null;
	private didSubmit = false;

	constructor(
		app: App,
		private onSubmit: (value: ExerciseModalResult | null) => void,
	) {
		super(app);
	}

	onOpen(): void {
		this.modalEl.addClass("fitness-tracker-modal");
		this.contentEl.createEl("h2", {
			cls: "fitness-tracker-modal-title",
			text: "Create exercise",
		});

		this.nameInputEl = createTextInputField(this.contentEl, {
			label: "Exercise name",
			placeholder: "Dumbbell bench press",
			onEnter: () => this.submit(),
		});
		this.musclesInputEl = createTextInputField(this.contentEl, {
			label: "Primary muscles",
			placeholder: "Chest, triceps",
			onEnter: () => this.submit(),
		});
		this.equipmentInputEl = createTextInputField(this.contentEl, {
			label: "Equipment",
			placeholder: "Dumbbells, bench",
			onEnter: () => this.submit(),
		});

		const submitButton = this.contentEl.createEl("button", {
			cls: "fitness-tracker-text-input-submit",
			text: "Create",
		});
		submitButton.addClass("mod-cta");
		submitButton.addEventListener("click", () => this.submit());

		this.nameInputEl.focus();
	}

	onClose(): void {
		this.contentEl.empty();

		if (!this.didSubmit) {
			this.onSubmit(null);
		}
	}

	private submit(): void {
		const name = this.nameInputEl?.value.trim() || "";

		if (!name) {
			return;
		}

		this.didSubmit = true;
		this.onSubmit({
			name,
			primaryMuscles: splitCommaSeparatedValues(this.musclesInputEl?.value || ""),
			equipment: splitCommaSeparatedValues(this.equipmentInputEl?.value || ""),
		});
		this.close();
	}
}

export function promptForExercise(app: App): Promise<ExerciseModalResult | null> {
	return new Promise((resolve) => {
		new ExerciseModal(app, resolve).open();
	});
}

function splitCommaSeparatedValues(value: string): string[] {
	return value.split(",").map((item) => item.trim()).filter(Boolean);
}
