const TEXT_INPUT_FIELD_CLASS = "fitness-tracker-text-input-field";

export interface TextInputFieldOptions {
	label?: string;
	placeholder?: string;
	value?: string;
	wrapperClass?: string;
	labelClass?: string;
	inputClass?: string;
	onChange?: (value: string) => void;
	onEnter?: () => void;
}

export function createTextInputField(
	containerEl: HTMLElement,
	options: TextInputFieldOptions,
): HTMLInputElement {
	const wrapper = containerEl.createDiv({
		cls: getWrapperClass(options),
	});

	if (options.label) {
		wrapper.createEl("label", { cls: options.labelClass, text: options.label });
	}

	const inputEl = wrapper.createEl("input", {
		cls: options.inputClass,
		type: "text",
		placeholder: options.placeholder || "",
		value: options.value || "",
	});

	inputEl.addEventListener("change", () => {
		options.onChange?.(inputEl.value.trim());
	});

	inputEl.addEventListener("keydown", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			options.onEnter?.();
		}
	});

	return inputEl;
}

function getWrapperClass(options: TextInputFieldOptions): string {
	return [
		TEXT_INPUT_FIELD_CLASS,
		options.wrapperClass || "",
	].filter(Boolean).join(" ");
}
