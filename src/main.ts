import {Plugin} from 'obsidian';
import { createExercise } from "exercises/create-exercise";
import { openExerciseLibraryView } from "exercises/open-exercise-library-view";
import {DEFAULT_SETTINGS, FitnessTrackerSettings, FitnessTrackerSettingTab} from "./settings/settings";
import { setPluginContext } from "context";

export default class FitnessTrackerPlugin extends Plugin {
	settings: FitnessTrackerSettings;

	async onload() {
		setPluginContext(this);
		await this.loadSettings();

		this.addCommand({
			id: "create-exercise",
			name: "Create exercise",
			callback: () => {
				void createExercise();
			},
		});

		this.addCommand({
			id: "open-exercise-library-view",
			name: "Open exercise library view",
			callback: () => {
				void openExerciseLibraryView();
			},
		});

		this.addSettingTab(new FitnessTrackerSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<FitnessTrackerSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
