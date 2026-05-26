import { getPlugin } from "context";
import { Notice, normalizePath, TFile } from "obsidian";
import { ensureFolder } from "utils/file-system";
import { createTrainingSplitFileName, createTrainingSplitNoteContent } from "./training-split-template";

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
			await plugin.app.workspace.getLeaf(false).openFile(existingFile);
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

		await plugin.app.workspace.getLeaf(false).openFile(file);
		new Notice(`Created training split: ${fileName}`);
	} catch (error) {
		console.error(error);
		new Notice("Failed to create training split");
	}
}
