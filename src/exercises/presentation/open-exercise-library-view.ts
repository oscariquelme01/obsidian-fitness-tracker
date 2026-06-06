import { getPlugin } from "shared/infrastructure/plugin-context";
import { Notice, normalizePath, TFile } from "obsidian";
import { ensureFolder, getParentFolder } from "shared/infrastructure/obsidian-file-system";
import { createExerciseLibraryViewContent } from "../infrastructure/markdown/exercise-library-view-markdown-template";

const EXERCISE_LIBRARY_VIEW_FILE_NAME = "Excercise Library.base";

export async function openExerciseLibraryView(): Promise<void> {
	const plugin = getPlugin();

	try {
		const exerciseFolder = normalizePath(
			plugin.settings.exerciseLibraryFolder,
		);
		const parentFolder = getParentFolder(exerciseFolder);
		const viewPath = normalizePath(
			parentFolder
				? `${parentFolder}/${EXERCISE_LIBRARY_VIEW_FILE_NAME}`
				: EXERCISE_LIBRARY_VIEW_FILE_NAME,
		);

		if (parentFolder) {
			await ensureFolder(parentFolder);
		}

		const existingFile = plugin.app.vault.getAbstractFileByPath(viewPath);

		if (existingFile instanceof TFile) {
			await plugin.app.workspace.getLeaf(false).openFile(existingFile);
			return;
		}

		if (existingFile) {
			new Notice(
				`Cannot create exercise library view. Path already exists: ${viewPath}`,
			);
			return;
		}

		const file = await plugin.app.vault.create(
			viewPath,
			createExerciseLibraryViewContent(exerciseFolder),
		);

		await plugin.app.workspace.getLeaf(false).openFile(file);
	} catch (error) {
		console.error(error);
		new Notice("Failed to open exercise library view");
	}
}
