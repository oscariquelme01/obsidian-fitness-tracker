import { AbstractInputSuggest, App } from "obsidian";
import { getVaultFolders } from "shared/infrastructure/obsidian-file-system";

export class FolderInputSuggest extends AbstractInputSuggest<string> {
	constructor(
		app: App,
		private inputEl: HTMLInputElement,
		private onChooseFolder: (folder: string) => Promise<void>,
	) {
		super(app, inputEl);
	}

	getSuggestions(inputStr: string): string[] {
		const query = inputStr.toLowerCase();

		return getVaultFolders()
			.filter((folder) => folder.toLowerCase().includes(query))
			.slice(0, 20);
	}

	renderSuggestion(folder: string, el: HTMLElement): void {
		el.setText(folder);
	}

	selectSuggestion(folder: string): void {
		this.inputEl.value = folder;
		this.close();
		void this.onChooseFolder(folder);
	}
}
