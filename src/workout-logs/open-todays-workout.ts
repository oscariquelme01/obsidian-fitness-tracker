import { getPlugin } from "context";
import { Notice, normalizePath, TFile } from "obsidian";
import { parseTrainingSplitDay } from "training-splits/training-split-parser";
import { ensureFolder, getLatestTrainingSplitFile } from "utils/file-system";
import { createWorkoutLogNoteContent } from "./workout-log-template";
import { formatDate } from "utils/dates";
import { slugify } from "utils/strings";

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
		const workoutLogFolder = normalizePath(plugin.settings.workoutLogFolder);
		await ensureFolder(workoutLogFolder);

		const fileName = createWorkoutLogFileName(today, workoutTitle);
		const workoutLogPath = normalizePath(`${workoutLogFolder}/${fileName}.md`);
		const existingFile = plugin.app.vault.getAbstractFileByPath(workoutLogPath);

		if (existingFile instanceof TFile) {
			await plugin.app.workspace.getLeaf(false).openFile(existingFile);
			return;
		}

		if (existingFile) {
			new Notice(`Cannot create workout. Path already exists: ${workoutLogPath}`);
			return;
		}

		const workoutFile = await plugin.app.vault.create(
			workoutLogPath,
			createWorkoutLogNoteContent({
				date: today,
				scheduledDay: todayName,
				workoutTitle,
				sourceTrainingSplitName: latestTrainingSplit.basename,
				exercises: parsedDay.exercises.map((exercise) => ({
					exerciseLink: exercise.exerciseLink,
					sets: exercise.sets,
					prescription: exercise.prescription,
				})),
			}),
		);

		await plugin.app.workspace.getLeaf(false).openFile(workoutFile);
		new Notice(`Created workout: ${fileName}`);
	} catch (error) {
		console.error(error);
		new Notice("Failed to open today's workout");
	}
}

function createWorkoutLogFileName(date: Date, workoutTitle: string): string {
	return `${formatDate(date)}-${slugify(workoutTitle)}`;
}
