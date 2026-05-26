import { getPlugin } from "context";
import { Notice, normalizePath, TFile } from "obsidian";
import { escapeDoubleQuotedString } from "utils/strings";
import { ensureFolder, getParentFolder } from "utils/file-system";

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

function createExerciseLibraryViewContent(exerciseFolder: string): string {
	return `views:
  - type: table
    name: Table
    filters:
      and:
        - file.inFolder("${escapeDoubleQuotedString(exerciseFolder)}")
    order:
      - file.name
      - movementPattern
      - equipment
      - primaryMuscles
      - secondaryMuscles
      - exerciseId
    sort:
      - property: movementPattern
        direction: ASC`;
}
