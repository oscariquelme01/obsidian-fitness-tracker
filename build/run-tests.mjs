import { rm, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";
import * as esbuild from "esbuild";

const testsDirectory = "tests";
const outputDirectory = ".test-build";

async function collectTestFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const path = join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...await collectTestFiles(path));
		} else if (entry.isFile() && entry.name.endsWith(".test.ts")) {
			files.push(path);
		}
	}

	return files;
}

const testFiles = await collectTestFiles(testsDirectory);

if (testFiles.length === 0) {
	throw new Error("No test files found.");
}

await rm(outputDirectory, { recursive: true, force: true });

await esbuild.build({
	entryPoints: testFiles,
	bundle: true,
	format: "esm",
	platform: "node",
	target: "node18",
	outdir: outputDirectory,
	entryNames: "[dir]/[name]",
	packages: "external",
});

const builtTestFiles = testFiles.map((file) => {
	return join(outputDirectory, basename(file)).replace(/\.ts$/, ".js");
});

const result = spawnSync(process.execPath, ["--test", ...builtTestFiles], {
	stdio: "inherit",
});

process.exit(result.status ?? 1);
