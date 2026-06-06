import { Notice, TFile } from "obsidian";
import { createTrainingSplit as createTrainingSplitUseCase } from "../application/create-training-split";
import { ObsidianTrainingSplitRepository } from "../infrastructure/obsidian-training-split-repository";
import { getPlugin } from "shared/infrastructure/plugin-context";
import { TRAINING_SPLIT_VIEW_TYPE } from "./training-split-view";

export async function createTrainingSplit(): Promise<void> {
	const plugin = getPlugin();

	try {
		const now = new Date();
		const repository = new ObsidianTrainingSplitRepository(plugin.app, plugin.settings);
		const fileRef = await createTrainingSplitUseCase(repository, { date: now });
		const file = plugin.app.vault.getAbstractFileByPath(fileRef.path);

		if (file instanceof TFile) {
			await openTrainingSplitFile(file);
			new Notice(fileRef.created ? `Created training split: ${fileRef.basename}` : `Training split already exists: ${fileRef.basename}`);
			return;
		}
	} catch (error) {
		console.error(error);
		new Notice("Failed to create training split");
	}
}

async function openTrainingSplitFile(file: TFile): Promise<void> {
	await getPlugin().app.workspace.getLeaf(false).setViewState({
		type: TRAINING_SPLIT_VIEW_TYPE,
		state: { file: file.path },
	});
}
