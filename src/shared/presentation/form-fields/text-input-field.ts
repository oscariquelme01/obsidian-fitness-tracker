const TEXT_INPUT_FIELD_CLASS = "fitness-tracker-text-input-field";

export interface TextInputFieldOptions {
	label: string;
	placeholder: string;
	onEnter?: () => void;
}

export function createTextInputField(
	containerEl: HTMLElement,
	options: TextInputFieldOptions,
): HTMLInputElement {
	const wrapper = containerEl.createDiv({ cls: TEXT_INPUT_FIELD_CLASS });
	wrapper.createEl("label", { text: options.label });
	const inputEl = wrapper.createEl("input", { type: "text", placeholder: options.placeholder });

	inputEl.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			options.onEnter?.();
		}
	});

	return inputEl;
}
