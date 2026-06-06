import { Plugin, ViewState, WorkspaceLeaf } from "obsidian";
import { createExercise } from "exercises/presentation/create-exercise";
import { openExerciseLibraryView } from "exercises/presentation/open-exercise-library-view";
import { createTrainingSplit } from "training-splits/presentation/create-training-split";
import { TRAINING_SPLIT_VIEW_TYPE, TrainingSplitView } from "training-splits/presentation/training-split-view";
import { openTodaysWorkout } from "workout-logs/presentation/open-todays-workout";
import { WORKOUT_LOG_VIEW_TYPE, WorkoutLogView } from "workout-logs/presentation/workout-log-view";
import { DEFAULT_SETTINGS, FitnessTrackerSettings, FitnessTrackerSettingTab } from "./settings/settings";
import { setPluginContext } from "shared/infrastructure/plugin-context";

export default class FitnessTrackerPlugin extends Plugin {
	settings: FitnessTrackerSettings;

	async onload() {
		setPluginContext(this);
		await this.loadSettings();
		this.registerView(WORKOUT_LOG_VIEW_TYPE, (leaf) => new WorkoutLogView(leaf));
		this.registerView(TRAINING_SPLIT_VIEW_TYPE, (leaf) => new TrainingSplitView(leaf));
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
		// eslint-disable-next-line @typescript-eslint/unbound-method
		const originalSetViewState = WorkspaceLeaf.prototype.setViewState;
		const app = this.app;

		const patchedSetViewState = function (
			this: WorkspaceLeaf,
			state: ViewState,
			eState?: unknown,
		) {
			const filePath = state.type === "markdown" && typeof state.state?.file === "string" ? state.state.file : null;
			const frontmatter = filePath ? app.metadataCache.getCache(filePath)?.frontmatter : null;
			const fitnessType = typeof frontmatter?.fitnessType === "string" ? frontmatter.fitnessType : undefined;
			const nextState = getFitnessViewState(state, fitnessType);

			return originalSetViewState.call(this, nextState, eState);
		};

		WorkspaceLeaf.prototype.setViewState = patchedSetViewState;

		this.register(() => {
			if (WorkspaceLeaf.prototype.setViewState === patchedSetViewState) {
				WorkspaceLeaf.prototype.setViewState = originalSetViewState;
			}
		});
	}
}

function getFitnessViewState(state: ViewState, fitnessType: string | undefined): ViewState {
	if (fitnessType === "workout-log") {
		return { ...state, type: WORKOUT_LOG_VIEW_TYPE };
	}

	if (fitnessType === "training-split") {
		return { ...state, type: TRAINING_SPLIT_VIEW_TYPE };
	}

	return state;
}
