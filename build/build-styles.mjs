import { watch } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

const sourceFile = "src/main.css";
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
	const sourceStyles = await resolveCssImports(sourceFile);
	const result = await postcss([
		tailwindcss("./tailwind.config.cjs"),
	]).process(sourceStyles, { from: sourceFile, to: outputFile });
	const styles = result.css;

	await mkdir(path.dirname(outputFile), { recursive: true });
	await writeFile(
		outputFile,
		`/* Generated from ${sourceFile}. Do not edit directly. */\n\n${styles}\n`,
	);
}

export async function watchStyles() {
	await buildStyles();
	let timeout = null;

	watch("src", { recursive: true }, (eventType, filename) => {
		if (!filename || !/\.(css|ts|tsx)$/.test(filename)) {
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
