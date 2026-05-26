import { getApp } from "context";
import { AbstractInputSuggest, App, TFolder } from "obsidian";

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

		return this.getVaultFolders()
			.filter((folder) => folder.toLowerCase().includes(query))
			.slice(0, 20);
	}

	renderSuggestion(folder: string, el: HTMLElement): void {
		el.setText(folder);
	}

	selectSuggestion(folder: string): void {
		this.inputEl.value = folder;
		void this.onChooseFolder(folder);
	}

	private getVaultFolders(): string[] {
		const app = getApp()
		
		return app.vault.getAllLoadedFiles()
			.filter((file): file is TFolder => file instanceof TFolder)
			.map((folder) => folder.path)
			.sort((a, b) => a.localeCompare(b));
	}
}
