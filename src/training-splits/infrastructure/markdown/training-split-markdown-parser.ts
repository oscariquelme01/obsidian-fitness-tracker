import {
	ParsedTrainingSplitDay,
	ParsedTrainingSplitDayResult,
	TrainingSplit,
	TrainingSplitDay,
	TrainingSplitExercise,
	TrainingSplitParseWarning,
} from "../../domain/training-split";

const WEEK_DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

interface ParsedDayHeading {
	day: string;
	heading: string;
	title: string | null;
}

export function parseTrainingSplit(markdown: string): TrainingSplit {
	const lines = markdown.split("\n");
	const frontmatter = parseFrontmatter(lines);
	const title = lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() || "Training split";
	const days: TrainingSplitDay[] = [];
	let currentDay: TrainingSplitDay | null = null;

	for (const line of lines) {
		const dayHeading = parseSimpleDayHeading(line);

		if (dayHeading) {
			currentDay = {
				day: dayHeading.day,
				title: dayHeading.title,
				exercises: [],
			};
			days.push(currentDay);
			continue;
		}

		if (!currentDay || !isBulletLine(line)) {
			continue;
		}

		const exercise = parseTrainingSplitExerciseLine(line);

		if (exercise) {
			currentDay.exercises.push(exercise);
		}
	}

	return { frontmatter, title, days };
}

export function parseTrainingSplitDay(markdown: string, targetDay: string): ParsedTrainingSplitDayResult {
	const warnings: TrainingSplitParseWarning[] = [];
	const lines = markdown.split("\n");
	let headingIndex = -1;
	let dayHeading: ParsedDayHeading | null = null;

	for (let index = 0; index < lines.length; index += 1) {
		const parsedHeading = parseDayHeading(lines[index] || "");

		if (parsedHeading?.day.toLowerCase() === targetDay.toLowerCase()) {
			headingIndex = index;
			dayHeading = parsedHeading;
			break;
		}
	}

	if (!dayHeading) {
		return { day: null, warnings };
	}

	const day: ParsedTrainingSplitDay = {
		day: dayHeading.day,
		heading: dayHeading.heading,
		title: dayHeading.title,
		exercises: [],
	};

	for (let index = headingIndex + 1; index < lines.length; index += 1) {
		const line = lines[index];
		const lineNumber = index + 1;

		if (line && isLevelTwoHeading(line)) {
			break;
		}

		if (!line || !isBulletLine(line)) {
			continue;
		}

		const parsedExercise = parsePlannedExerciseLine(line, lineNumber, warnings);
		if (parsedExercise) {
			day.exercises.push(parsedExercise);
		}
	}

	return { day, warnings };
}

function parseFrontmatter(lines: string[]): Record<string, string> {
	const frontmatter: Record<string, string> = {
		fitnessType: "training-split",
	};

	if (lines[0] !== "---") {
		return frontmatter;
	}

	for (let index = 1; index < lines.length; index += 1) {
		const line = lines[index];

		if (line === "---") {
			break;
		}

		const separatorIndex = line?.indexOf(":") ?? -1;

		if (!line || separatorIndex === -1) {
			continue;
		}

		frontmatter[line.slice(0, separatorIndex).trim()] = line.slice(separatorIndex + 1).trim();
	}

	return frontmatter;
}

function parseSimpleDayHeading(line: string): { day: string; title: string } | null {
	const parsed = parseDayHeading(line);

	if (!parsed) {
		return null;
	}

	return { day: parsed.day, title: parsed.title || "" };
}

function parseDayHeading(line: string): ParsedDayHeading | null {
	const headingMatch = line.match(/^##\s+(.+)$/);
	const heading = headingMatch?.[1]?.trim();

	if (!heading) {
		return null;
	}

	const day = WEEK_DAYS.find((weekDay) => heading.toLowerCase().startsWith(weekDay.toLowerCase()));

	if (!day) {
		return null;
	}

	const titleMatch = heading.match(new RegExp(`^${day}:\\s*(.+)$`, "i"));

	return { day, heading, title: titleMatch?.[1]?.trim() || null };
}

function isBulletLine(line: string): boolean {
	return /^\s*[-*]\s+/.test(line);
}

function isLevelTwoHeading(line: string): boolean {
	return /^##\s+/.test(line);
}

function parseTrainingSplitExerciseLine(line: string): TrainingSplitExercise | null {
	const fields = splitMarkdownFields(line.replace(/^\s*[-*]\s+/, "").trim());
	const exerciseLink = fields[0];

	if (!exerciseLink || !/^\[\[[^\]]+\]\]$/.test(exerciseLink)) {
		return null;
	}

	const extraFields: string[] = [];
	let sets = "";
	let reps = "";

	for (const field of fields.slice(1)) {
		const setsMatch = field.match(/^(\d+)\s*sets?$/i);
		const repsMatch = field.match(/^(.+)\s+reps?$/i);

		if (setsMatch?.[1]) {
			sets = setsMatch[1];
		} else if (repsMatch?.[1]) {
			reps = repsMatch[1].trim();
		} else {
			extraFields.push(field);
		}
	}

	return { exerciseLink, sets, reps, extraFields };
}

function parsePlannedExerciseLine(
	line: string,
	lineNumber: number,
	warnings: TrainingSplitParseWarning[],
) {
	const bulletContent = line.replace(/^\s*[-*]\s+/, "").trim();
	const fields = splitMarkdownFields(bulletContent);
	const exerciseField = fields[0];

	if (!exerciseField) {
		warnings.push({ lineNumber, message: "Exercise line is empty." });
		return null;
	}

	const exerciseLinkMatch = exerciseField.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);

	if (!exerciseLinkMatch) {
		warnings.push({ lineNumber, message: "Exercise line must start with an exercise wiki link." });
		return null;
	}

	const exerciseName = exerciseLinkMatch[1]?.trim();

	if (!exerciseName) {
		warnings.push({ lineNumber, message: "Exercise wiki link is empty." });
		return null;
	}

	const prescriptionFields = fields.slice(1);
	const sets = parseSets(prescriptionFields);

	if (!sets) {
		warnings.push({ lineNumber, message: "Exercise line must include a set count, like '3 sets'." });
		return null;
	}

	return {
		lineNumber,
		exerciseLink: exerciseLinkMatch[0],
		exerciseName,
		sets,
		reps: parseReps(prescriptionFields),
		prescription: prescriptionFields.join(" | "),
	};
}

function splitMarkdownFields(value: string): string[] {
	const fields: string[] = [];
	let currentField = "";
	let wikiLinkDepth = 0;

	for (let index = 0; index < value.length; index += 1) {
		const currentCharacter = value[index];
		const nextCharacter = value[index + 1];

		if (currentCharacter === "[" && nextCharacter === "[") {
			wikiLinkDepth += 1;
			currentField += currentCharacter;
			continue;
		}

		if (currentCharacter === "]" && nextCharacter === "]" && wikiLinkDepth > 0) {
			wikiLinkDepth -= 1;
			currentField += currentCharacter;
			continue;
		}

		if (currentCharacter === "|" && wikiLinkDepth === 0) {
			fields.push(currentField.trim());
			currentField = "";
			continue;
		}

		currentField += currentCharacter;
	}

	fields.push(currentField.trim());

	return fields.filter(Boolean);
}

function parseSets(fields: string[]): number | null {
	for (const field of fields) {
		const match = field.match(/^(\d+)\s*sets?$/i);

		if (match?.[1]) {
			return Number(match[1]);
		}
	}

	return null;
}

function parseReps(fields: string[]): string | null {
	for (const field of fields) {
		const match = field.match(/^(.+)\s+reps?$/i);

		if (match?.[1]) {
			return match[1].trim();
		}
	}

	return null;
}
