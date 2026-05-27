import {Plugin} from 'obsidian';
import { createExercise } from "exercises/create-exercise";
import { openExerciseLibraryView } from "exercises/open-exercise-library-view";
import { createTrainingSplit } from "training-splits/create-training-split";
import { openTodaysWorkout } from "workout-logs/open-todays-workout";
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

		this.addCommand({
			id: "create-training-split",
			name: "Create training split",
			callback: () => {
				void createTrainingSplit();
			},
		});

		this.addCommand({
			id: "open-todays-workout",
			name: "Open today's workout",
			callback: () => {
				void openTodaysWorkout();
			},
		});

		this.addRibbonIcon("calendar-check", "Open today's workout", () => {
			void openTodaysWorkout();
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
