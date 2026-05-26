import { getApp, getPlugin } from "context";
import { TFolder } from "obsidian";

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
