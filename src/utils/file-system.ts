import { getApp, getPlugin } from "context";
import { normalizePath, TFile, TFolder } from "obsidian";

export async function ensureFolder(folderPath: string): Promise<void> {
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

export function getVaultFolders(): string[] {
	const app = getApp()
	
	return app.vault.getAllLoadedFiles()
		.filter((file): file is TFolder => file instanceof TFolder)
		.map((folder) => folder.path)
		.sort((a, b) => a.localeCompare(b));
}

export function getParentFolder(folderPath: string): string {
	const lastSlashIndex = folderPath.lastIndexOf("/");

	if (lastSlashIndex === -1) {
		return "";
	}

	return folderPath.slice(0, lastSlashIndex);
}

function compareTrainingSplitsDescending(left: TFile, right: TFile): number {
	return right.basename.localeCompare(left.basename);
}

export function getLatestTrainingSplitFile(): TFile | null {
	const plugin = getPlugin();
	const trainingSplitFolder = normalizePath(plugin.settings.trainingSplitFolder);
	const trainingSplitFiles = plugin.app.vault.getFiles()
		.filter((file) => file.parent?.path === trainingSplitFolder)
		.filter((file) => /^Training-\d{4}-\d{2}-\d{2}$/.test(file.basename));

	return trainingSplitFiles.sort(compareTrainingSplitsDescending)[0] || null;
}
