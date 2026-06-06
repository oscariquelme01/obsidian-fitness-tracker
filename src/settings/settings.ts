import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { getPlugin } from "shared/infrastructure/plugin-context";
import { FolderInputSuggest } from "shared/presentation/folder-input-suggest";

export interface FitnessTrackerSettings {
	exerciseLibraryFolder: string;
	trainingSplitFolder: string;
	workoutLogFolder: string;
}

export const DEFAULT_SETTINGS: FitnessTrackerSettings = {
	exerciseLibraryFolder: "02 - Areas/Training/Exercises",
	trainingSplitFolder: "02 - Areas/Training/Splits",
	workoutLogFolder: "02 - Areas/Training/Logs",
};

export class FitnessTrackerSettingTab extends PluginSettingTab {
	constructor(app: App, plugin: Plugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		const plugin = getPlugin();

		containerEl.empty();

		this.addFolderSetting(containerEl, {
			name: "Exercise library folder",
			description: "Folder containing exercise definition notes.",
			value: plugin.settings.exerciseLibraryFolder,
			onChange: async (value) => {
				plugin.settings.exerciseLibraryFolder = value;
				await plugin.saveSettings();
			},
		});

		this.addFolderSetting(containerEl, {
			name: "Training split folder",
			description: "Folder containing training split template notes.",
			value: plugin.settings.trainingSplitFolder,
			onChange: async (value) => {
				plugin.settings.trainingSplitFolder = value;
				await plugin.saveSettings();
			},
		});

		this.addFolderSetting(containerEl, {
			name: "Workout log folder",
			description:
				"Folder where generated workout log notes will be stored.",
			value: plugin.settings.workoutLogFolder,
			onChange: async (value) => {
				plugin.settings.workoutLogFolder = value;
				await plugin.saveSettings();
			},
		});
	}

	private addFolderSetting(
		containerEl: HTMLElement,
		options: {
			name: string;
			description: string;
			value: string;
			onChange: (value: string) => Promise<void>;
		},
	): void {
		new Setting(containerEl)
			.setName(options.name)
			.setDesc(options.description)
			.addText((text) => {
				text
					.setPlaceholder("Choose a folder")
					.setValue(options.value)
					.onChange(options.onChange);

				new FolderInputSuggest(this.app, text.inputEl, options.onChange);
			});
	}
}
