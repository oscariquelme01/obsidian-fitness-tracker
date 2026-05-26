import { Notice, normalizePath, TFile, TFolder } from "obsidian";
import { getPlugin } from "context";
import { promptForText } from "../ui/text-input-modal";
import { createExerciseFileName, createExerciseNoteContent } from "./exercise-template";

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
		const exerciseFolder = normalizePath(plugin.settings.exerciseLibraryFolder);
		await ensureFolder(exerciseFolder);

		const fileName = createExerciseFileName(exerciseName);
		const exercisePath = normalizePath(`${exerciseFolder}/${fileName}.md`);
		const existingFile = plugin.app.vault.getAbstractFileByPath(exercisePath);

		if (existingFile instanceof TFile) {
			await plugin.app.workspace.getLeaf(false).openFile(existingFile);
			new Notice(`Exercise already exists: ${exerciseName}`);
			return;
		}

		if (existingFile) {
			new Notice(`Cannot create exercise. Path already exists: ${exercisePath}`);
			return;
		}

		const file = await plugin.app.vault.create(
			exercisePath,
			createExerciseNoteContent(exerciseName),
		);

		await plugin.app.workspace.getLeaf(false).openFile(file);
		new Notice(`Created exercise: ${exerciseName}`);
	} catch (error) {
		console.error(error);
		new Notice("Failed to create exercise");
	}
}

async function ensureFolder(folderPath: string): Promise<void> {
	const plugin = getPlugin();
	const pathParts = folderPath.split("/").filter(Boolean);
	let currentPath = "";

	for (const part of pathParts) {
		currentPath = currentPath ? `${currentPath}/${part}` : part;
		const existingFile = plugin.app.vault.getAbstractFileByPath(currentPath);

		if (existingFile instanceof TFolder) {
			continue;
		}

		if (existingFile) {
			throw new Error(`Expected folder but found file: ${currentPath}`);
		}

		await plugin.app.vault.createFolder(currentPath);
	}
}
