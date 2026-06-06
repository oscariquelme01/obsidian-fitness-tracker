import { Notice } from "obsidian";
import { createExercise as createExerciseUseCase } from "../application/create-exercise";
import { ObsidianExerciseRepository } from "../infrastructure/obsidian-exercise-repository";
import { getPlugin } from "shared/infrastructure/plugin-context";
import { promptForText } from "shared/presentation/text-input-modal";

export async function createExercise(): Promise<void> {
	const plugin = getPlugin();
	const exerciseName = await promptForText(
		plugin.app,
		"Create exercise",
		"Dumbbell bench press",
	);

	if (!exerciseName) {
		return;
	}

	try {
		const repository = new ObsidianExerciseRepository(plugin.app, plugin.settings);
		const result = await createExerciseUseCase(repository, { name: exerciseName });
		await plugin.app.workspace.openLinkText(result.exercise.name, "", false);
		new Notice(result.created ? `Created exercise: ${exerciseName}` : `Exercise already exists: ${exerciseName}`);
	} catch (error) {
		console.error(error);
		new Notice("Failed to create exercise");
	}
}
