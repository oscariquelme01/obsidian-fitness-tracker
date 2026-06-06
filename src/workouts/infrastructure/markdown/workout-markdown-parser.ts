import {
	Workout,
	WorkoutExercise,
	WorkoutSet,
} from "../../domain/workout";

interface WorkoutMarkdownFrontmatter {
	fitnessType: string;
	workoutDate: string;
	sourceTrainingSplit: string;
}

export function parseWorkout(markdown: string): Workout {
	const lines = markdown.split("\n");
	const frontmatter = parseFrontmatter(lines);
	const title = lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() || "Workout";
	const sourceTrainingSplit = lines.find((line) => line.startsWith("Source split:"))
		?.replace(/^Source split:\s*/, "")
		.trim() || "";
	const exercises: WorkoutExercise[] = [];
	let currentExercise: WorkoutExercise | null = null;

	for (const line of lines) {
		if (line.startsWith("### ")) {
			currentExercise = {
				exerciseName: parseExerciseName(line.replace(/^###\s+/, "").trim()),
				prescription: "",
				notes: "",
				sets: [],
			};
			exercises.push(currentExercise);
			continue;
		}

		if (!currentExercise) {
			continue;
		}

		if (line.startsWith("Prescription:")) {
			currentExercise.prescription = line.replace(/^Prescription:\s*/, "").trim();
			continue;
		}

		if (line.startsWith("Notes:")) {
			currentExercise.notes = line.replace(/^Notes:\s*/, "").trim();
			continue;
		}

		const parsedSet = parseSetLine(line);

		if (parsedSet) {
			currentExercise.sets.push(parsedSet);
		}
	}

	return {
		date: frontmatter.workoutDate,
		title,
		sourceTrainingSplit,
		exercises,
	};
}

function parseExerciseName(value: string): string {
	const wikiLinkMatch = value.match(/^\[\[([^\]|]+)(?:\|[^\]]+)?\]\]$/);

	return wikiLinkMatch?.[1]?.trim() || value;
}

function parseFrontmatter(lines: string[]): WorkoutMarkdownFrontmatter {
	const frontmatter: WorkoutMarkdownFrontmatter = {
		fitnessType: "workout-log",
		workoutDate: "",
		sourceTrainingSplit: "",
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

		if (separatorIndex === -1 || !line) {
			continue;
		}

		const key = line.slice(0, separatorIndex).trim();
		const value = line.slice(separatorIndex + 1).trim();

		if (key === "fitnessType" || key === "workoutDate" || key === "sourceTrainingSplit") {
			frontmatter[key] = value;
		}
	}

	return frontmatter;
}

function parseSetLine(line: string): WorkoutSet | null {
	const match = line.match(/^[-*]\s+(?:\[([ xX])\]\s+)?Set\s+\d+:\s*weight=(.*?)\s+reps=(.*?)\s+rpe=(.*?)\s+notes=(.*)$/i);

	if (!match) {
		return null;
	}

	return {
		completed: match[1]?.toLowerCase() === "x",
		weight: match[2]?.trim() || "",
		reps: match[3]?.trim() || "",
		rpe: match[4]?.trim() || "",
		notes: match[5]?.trim() || "",
	};
}
