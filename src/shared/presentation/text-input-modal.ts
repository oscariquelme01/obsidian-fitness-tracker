import { App, Modal } from "obsidian";

export class TextInputModal extends Modal {
	private inputEl: HTMLInputElement | null = null;
	private didSubmit = false;

	constructor(
		app: App,
		private title: string,
		private placeholder: string,
		private onSubmit: (value: string | null) => void,
	) {
		super(app);
	}

	onOpen(): void {
		const { contentEl } = this;
		this.modalEl.addClass("fitness-tracker-modal");

		contentEl.createEl("h2", {
			cls: "fitness-tracker-modal-title",
			text: this.title,
		});

		const formEl = contentEl.createDiv({ cls: "fitness-tracker-text-input-modal" });

		this.inputEl = formEl.createEl("input", {
			cls: "fitness-tracker-text-input",
			type: "text",
			placeholder: this.placeholder,
		});

		this.inputEl.addEventListener("keydown", (event) => {
			if (event.key === "Enter") {
				event.preventDefault();
				this.submit();
			}
		});

		const buttonEl = formEl.createEl("button", {
			cls: "fitness-tracker-text-input-submit",
			text: "Create",
		});
		buttonEl.addClass("mod-cta");
		buttonEl.addEventListener("click", () => this.submit());

		this.inputEl?.focus();
	}

	onClose(): void {
		this.contentEl.empty();

		if (!this.didSubmit) {
			this.onSubmit(null);
		}
	}

	private submit(): void {
		const value = this.inputEl?.value.trim() ?? "";

		if (!value) {
			return;
		}

		this.didSubmit = true;
		this.onSubmit(value);
		this.close();
	}
}

export function promptForText(app: App, title: string, placeholder: string): Promise<string | null> {
	return new Promise((resolve) => {
		new TextInputModal(app, title, placeholder, resolve).open();
	});
}
