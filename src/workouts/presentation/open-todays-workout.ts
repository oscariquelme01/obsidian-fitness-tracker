import { getPlugin } from "shared/infrastructure/plugin-context";
import { Notice, TFile } from "obsidian";
import { ObsidianTrainingSplitRepository } from "training-splits/infrastructure/obsidian-training-split-repository";
import { createWorkout } from "../application/create-workout";
import { ObsidianWorkoutRepository } from "../infrastructure/obsidian-workout-repository";
import { WORKOUT_VIEW_TYPE } from "./workout-view";

export async function openTodaysWorkout(): Promise<void> {
	const plugin = getPlugin();
	const today = new Date();
	const workoutRepository = new ObsidianWorkoutRepository(plugin.app, plugin.settings);

	try {
		const result = await createWorkout(
			{ date: today },
			{
				trainingSplitRepository: new ObsidianTrainingSplitRepository(plugin.app, plugin.settings),
				workoutRepository,
			},
		);

		if (!result) {
			new Notice("No workout found for today");
			return;
		}

		const file = workoutRepository.getFileByDate(today);
		if (!(file instanceof TFile)) {
			new Notice("Workout file not found");
			return;
		}

		await openWorkoutFile(file);

		if (result.created) {
			new Notice(`Created workout: ${result.workout.title}`);
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
