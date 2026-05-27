import { getPlugin } from "context";
import { Notice, normalizePath, TFile } from "obsidian";
import { ensureFolder } from "utils/file-system";
import { createTrainingSplitFileName, createTrainingSplitNoteContent } from "./training-split-template";
import { TRAINING_SPLIT_VIEW_TYPE } from "./training-split-view";

export async function createTrainingSplit(): Promise<void> {
	const plugin = getPlugin();

	try {
		const now = new Date();
		const trainingSplitFolder = normalizePath(plugin.settings.trainingSplitFolder);
		await ensureFolder(trainingSplitFolder);

		const fileName = createTrainingSplitFileName(now);
		const trainingSplitPath = normalizePath(`${trainingSplitFolder}/${fileName}.md`);
		const existingFile = plugin.app.vault.getAbstractFileByPath(trainingSplitPath);

		if (existingFile instanceof TFile) {
			await openTrainingSplitFile(existingFile);
			new Notice(`Training split already exists: ${fileName}`);
			return;
		}

		if (existingFile) {
			new Notice(`Cannot create training split. Path already exists: ${trainingSplitPath}`);
			return;
		}

		const file = await plugin.app.vault.create(
			trainingSplitPath,
			createTrainingSplitNoteContent(now),
		);

		await openTrainingSplitFile(file);
		new Notice(`Created training split: ${fileName}`);
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
