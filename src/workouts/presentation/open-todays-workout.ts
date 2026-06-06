import { getPlugin } from "shared/infrastructure/plugin-context";
import { Notice, TFile } from "obsidian";
import { ObsidianTrainingSplitRepository } from "training-splits/infrastructure/obsidian-training-split-repository";
import { createWorkout } from "../application/create-workout";
import { ObsidianWorkoutRepository } from "../infrastructure/obsidian-workout-repository";
import { WORKOUT_VIEW_TYPE } from "./workout-view";

export async function openTodaysWorkout(): Promise<void> {
	const plugin = getPlugin();

	try {
		const workout = await createWorkout(
			{ date: new Date() },
			{
				trainingSplitRepository: new ObsidianTrainingSplitRepository(plugin.app, plugin.settings),
				workoutRepository: new ObsidianWorkoutRepository(plugin.app, plugin.settings),
			},
		);

		if (!workout) {
			new Notice("No workout found for today");
			return;
		}

		const file = plugin.app.vault.getAbstractFileByPath(workout.path);
		if (!(file instanceof TFile)) {
			new Notice(`Workout file not found: ${workout.path}`);
			return;
		}

		await openWorkoutFile(file);

		if (workout.created) {
			new Notice(`Created workout: ${workout.basename}`);
		}
	} catch (error) {
		console.error(error);
		new Notice("Failed to open today's workout");
	}
}

async function openWorkoutFile(file: TFile): Promise<void> {
	await getPlugin().app.workspace.getLeaf(false).setViewState({
		type: WORKOUT_VIEW_TYPE,
		state: { file: file.path },
	});
}
