const WEEK_DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export interface ParsedTrainingSplit {
	days: ParsedTrainingSplitDay[];
	warnings: TrainingSplitParseWarning[];
}

export interface ParsedTrainingSplitDay {
	day: string;
	heading: string;
	title: string | null;
	exercises: ParsedTrainingSplitExercise[];
}

export interface ParsedTrainingSplitExercise {
	lineNumber: number;
	exerciseLink: string;
	exerciseName: string;
	sets: number;
	reps: string | null;
	prescription: string;
}

export interface TrainingSplitParseWarning {
	lineNumber: number;
	message: string;
}

export interface ParsedTrainingSplitDayResult {
	day: ParsedTrainingSplitDay | null;
	warnings: TrainingSplitParseWarning[];
}

interface ParsedDayHeading {
	day: string;
	heading: string;
	title: string | null;
}

export function parseTrainingSplitDay(markdown: string, targetDay: string): ParsedTrainingSplitDayResult {
	const warnings: TrainingSplitParseWarning[] = [];
	const lines = markdown.split("\n");

	let headingIndex = -1;
	let dayHeading: ParsedDayHeading | null = null;

	// find the heading for today's date
	for (let index = 0; index < lines.length; index += 1) {
		const parsedHeading = parseDayHeading(lines[index] || "");

		if (parsedHeading?.day.toLowerCase() === targetDay.toLowerCase()) {
			headingIndex = index;
			dayHeading = parsedHeading;
			break;
		}
	}

	// Day not found in the template, no workout of the day for today's date
	if (!dayHeading) {
		return { day: null, warnings };
	}

	const day: ParsedTrainingSplitDay = {
		day: dayHeading.day,
		heading: dayHeading.heading,
		title: dayHeading.title,
		exercises: [],
	};

	// Start from the heading index, loop till no more lines available or new two level heading found
	for (let index = headingIndex + 1; index < lines.length; index += 1) {
		const line = lines[index];
		const lineNumber = index + 1;

		// if new header found, stop 
		if (line && isLevelTwoHeading(line)) {
			break;
		}

		// ignore empty lines or non bullet lines
		if (!line || !isBulletLine(line)) {
			continue
		}

		const parsedExercise = parseExerciseLine(line, lineNumber, warnings);
		if (parsedExercise) {
			day.exercises.push(parsedExercise);
		}
	}

	return { day, warnings };
}

function parseDayHeading(line: string): ParsedDayHeading | null {
	const headingMatch = line.match(/^##\s+(.+)$/);

	if (!headingMatch) {
		return null;
	}

	const heading = headingMatch[1]?.trim();

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

function parseExerciseLine(
	line: string,
	lineNumber: number,
	warnings: TrainingSplitParseWarning[],
): ParsedTrainingSplitExercise | null {
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
