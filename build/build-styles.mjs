import { watch } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const sourceFile = "src/shared/presentation/index.css";
const outputFile = "styles.css";

async function resolveCssImports(filePath, seen = new Set()) {
	const normalizedPath = path.normalize(filePath);

	if (seen.has(normalizedPath)) {
		return "";
	}

	seen.add(normalizedPath);

	const source = await readFile(normalizedPath, "utf8");
	const lines = source.split("\n");
	const output = [];

	for (const line of lines) {
		const importMatch = line.match(/^@import\s+"(.+)";\s*$/);

		if (!importMatch?.[1]) {
			output.push(line);
			continue;
		}

		const importedPath = path.join(path.dirname(normalizedPath), importMatch[1]);
		output.push(await resolveCssImports(importedPath, seen));
	}

	return output.join("\n").trim();
}

export async function buildStyles() {
	const styles = await resolveCssImports(sourceFile);
	await writeFile(
		outputFile,
		`/* Generated from ${sourceFile}. Do not edit directly. */\n\n${styles}\n`,
	);
}

export async function watchStyles() {
	await buildStyles();
	let timeout = null;

	watch("src", { recursive: true }, (eventType, filename) => {
		if (!filename?.endsWith(".css")) {
			return;
		}

		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			void buildStyles().catch((error) => {
				console.error("Failed to build styles", error);
			});
		}, 50);
	});
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
	await buildStyles();
}
