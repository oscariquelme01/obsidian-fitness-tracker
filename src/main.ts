import {Plugin, WorkspaceLeaf} from 'obsidian';
import { createExercise } from "exercises/create-exercise";
import { openExerciseLibraryView } from "exercises/open-exercise-library-view";
import { createTrainingSplit } from "training-splits/create-training-split";
import { openTodaysWorkout } from "workout-logs/open-todays-workout";
import { WORKOUT_LOG_VIEW_TYPE, WorkoutLogView } from "workout-logs/workout-log-view";
import {DEFAULT_SETTINGS, FitnessTrackerSettings, FitnessTrackerSettingTab} from "./settings/settings";
import { setPluginContext } from "context";

export default class FitnessTrackerPlugin extends Plugin {
	settings: FitnessTrackerSettings;

	async onload() {
		setPluginContext(this);
		await this.loadSettings();
		this.registerView(WORKOUT_LOG_VIEW_TYPE, (leaf) => new WorkoutLogView(leaf));
		this.registerWorkoutLogAutoOpen();

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

	private registerWorkoutLogAutoOpen(): void {
		const originalSetViewState = WorkspaceLeaf.prototype.setViewState;
		const plugin = this;

		const patchedSetViewState = function (
			this: WorkspaceLeaf,
			state: any,
			...rest: any[]
		) {
			const filePath = state.type === "markdown" ? state.state?.file as string | undefined : null;
			const frontmatter = filePath ? plugin.app.metadataCache.getCache(filePath)?.frontmatter : null;
			const nextState = frontmatter?.fitnessType === "workout-log"
				? { ...state, type: WORKOUT_LOG_VIEW_TYPE }
				: state;

			return originalSetViewState.call(this, nextState, ...rest);
		};

		WorkspaceLeaf.prototype.setViewState = patchedSetViewState;

		this.register(() => {
			if (WorkspaceLeaf.prototype.setViewState === patchedSetViewState) {
				WorkspaceLeaf.prototype.setViewState = originalSetViewState;
			}
		});
	}
}
