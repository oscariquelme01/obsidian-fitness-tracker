import { getPlugin } from "shared/infrastructure/plugin-context";
import { Notice, normalizePath, TFile } from "obsidian";
import { parseTrainingSplitDay } from "training-splits/infrastructure/markdown/training-split-markdown-parser";
import { ensureFolder, getLatestTrainingSplitFile } from "shared/infrastructure/obsidian-file-system";
import { createWorkoutNoteContent } from "../infrastructure/markdown/workout-markdown-template";
import { formatDate } from "shared/domain/dates";
import { slugify } from "shared/domain/strings";
import { WORKOUT_VIEW_TYPE } from "./workout-view";

const WEEK_DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

export async function openTodaysWorkout(): Promise<void> {
	const plugin = getPlugin();

	try {
		const today = new Date();
		const todayName = WEEK_DAYS[today.getDay()];

		if (!todayName) {
			new Notice("Could not resolve today's weekday");
			return;
		}

		const latestTrainingSplit = getLatestTrainingSplitFile();
		if (!latestTrainingSplit) {
			new Notice("No training split found");
			return;
		}

		const splitMarkdown = await plugin.app.vault.read(latestTrainingSplit);
		const parsedSplit = parseTrainingSplitDay(splitMarkdown, todayName);
		const parsedDay = parsedSplit.day;
		if (!parsedDay) {
			new Notice(`No ${todayName} section found in latest training split`);
			return;
		}

		const workoutTitle = parsedDay.title || `${todayName} workout`;
		const workoutFolder = normalizePath(plugin.settings.workoutLogFolder);
		await ensureFolder(workoutFolder);

		const fileName = createWorkoutFileName(today, workoutTitle);
		const workoutPath = normalizePath(`${workoutFolder}/${fileName}.md`);
		const existingFile = plugin.app.vault.getAbstractFileByPath(workoutPath);

		if (existingFile instanceof TFile) {
			await openWorkoutFile(existingFile);
			return;
		}

		if (existingFile) {
			new Notice(`Cannot create workout. Path already exists: ${workoutPath}`);
			return;
		}

		const workoutFile = await plugin.app.vault.create(
			workoutPath,
			createWorkoutNoteContent({
				date: today,
				scheduledDay: todayName,
				workoutTitle,
				sourceTrainingSplitPath: latestTrainingSplit.path,
				sourceTrainingSplitName: latestTrainingSplit.basename,
				exercises: parsedDay.exercises.map((exercise) => ({
					exerciseName: exercise.exerciseName,
					sets: exercise.sets,
					prescription: exercise.prescription,
				})),
			}),
		);

		await openWorkoutFile(workoutFile);
		new Notice(`Created workout: ${fileName}`);
	} catch (error) {
		console.error(error);
		new Notice("Failed to open today's workout");
	}
}

async function openWorkoutFile(file: TFile): Promise<void> {
	await getPlugin().app.workspace.getLeaf(false).setViewState({
		type: WORKOUT_VIEW_TYPE,
		state: { file: file.path },
	});
}

function createWorkoutFileName(date: Date, workoutTitle: string): string {
	return `${formatDate(date)}-${slugify(workoutTitle)}`;
}
