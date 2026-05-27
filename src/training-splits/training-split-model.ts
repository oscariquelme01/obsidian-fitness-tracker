const WEEK_DAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export interface TrainingSplit {
	frontmatter: Record<string, string>;
	title: string;
	days: TrainingSplitDay[];
}

export interface TrainingSplitDay {
	day: string;
	title: string;
	exercises: TrainingSplitExercise[];
}

export interface TrainingSplitExercise {
	exerciseLink: string;
	sets: string;
	reps: string;
	extraFields: string[];
}

export function parseTrainingSplit(markdown: string): TrainingSplit {
	const lines = markdown.split("\n");
	const frontmatter = parseFrontmatter(lines);
	const title = lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() || "Training split";
	const days: TrainingSplitDay[] = [];
	let currentDay: TrainingSplitDay | null = null;

	for (const line of lines) {
		const dayHeading = parseDayHeading(line);

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

		const exercise = parseExerciseLine(line);

		if (exercise) {
			currentDay.exercises.push(exercise);
		}
	}

	return { frontmatter, title, days };
}

export function serializeTrainingSplit(split: TrainingSplit): string {
	return `${serializeFrontmatter(split.frontmatter)}

# ${split.title}

Use \`## Monday: Push day\` headings and exercise bullets formatted as \`- [[Exercise]] | 3 sets | 8 reps | RPE 8\`.

${split.days.map(serializeDay).join("\n")}`;
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

function serializeFrontmatter(frontmatter: Record<string, string>): string {
	const data = { ...frontmatter, fitnessType: frontmatter.fitnessType || "training-split" };

	return `---\n${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join("\n")}\n---`;
}

function parseDayHeading(line: string): { day: string; title: string } | null {
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

	return { day, title: titleMatch?.[1]?.trim() || "" };
}

function isBulletLine(line: string): boolean {
	return /^\s*[-*]\s+/.test(line);
}

function parseExerciseLine(line: string): TrainingSplitExercise | null {
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

function serializeDay(day: TrainingSplitDay): string {
	const title = day.title ? `: ${day.title}` : "";
	const exercises = day.exercises.map(serializeExercise).join("\n");

	return `## ${day.day}${title}\n\n${exercises}\n`;
}

function serializeExercise(exercise: TrainingSplitExercise): string {
	const fields = [
		exercise.exerciseLink,
		exercise.sets ? `${exercise.sets} sets` : "",
		exercise.reps ? `${exercise.reps} reps` : "",
		...exercise.extraFields,
	].filter(Boolean);

	return `- ${fields.join(" | ")}`;
}
