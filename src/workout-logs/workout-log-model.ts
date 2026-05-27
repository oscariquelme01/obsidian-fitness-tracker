// TODO: review this. this is vibecoded, fine for v1 tho
export interface WorkoutLog {
	frontmatter: WorkoutLogFrontmatter;
	title: string;
	sourceTrainingSplit: string;
	exercises: WorkoutLogExerciseEntry[];
}

export interface WorkoutLogFrontmatter {
	fitnessType: string;
	workoutDate: string;
	sourceTrainingSplit: string;
	scheduledDay: string;
}

export interface WorkoutLogExerciseEntry {
	exerciseLink: string;
	prescription: string;
	notes: string;
	sets: WorkoutLogSetEntry[];
}

export interface WorkoutLogSetEntry {
	completed: boolean;
	weight: string;
	reps: string;
	rpe: string;
	notes: string;
}

export function parseWorkoutLog(markdown: string): WorkoutLog {
	const lines = markdown.split("\n");
	const frontmatter = parseFrontmatter(lines);
	const title = lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() || "Workout";
	const sourceTrainingSplit = lines.find((line) => line.startsWith("Source split:"))
		?.replace(/^Source split:\s*/, "")
		.trim() || "";
	const exercises: WorkoutLogExerciseEntry[] = [];
	let currentExercise: WorkoutLogExerciseEntry | null = null;

	for (const line of lines) {
		if (line.startsWith("### ")) {
			currentExercise = {
				exerciseLink: line.replace(/^###\s+/, "").trim(),
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
		frontmatter,
		title,
		sourceTrainingSplit,
		exercises,
	};
}

export function serializeWorkoutLog(workoutLog: WorkoutLog): string {
	const exerciseSections = workoutLog.exercises.length > 0
		? workoutLog.exercises.map(serializeExercise).join("\n")
		: "No exercises scheduled.\n";

	return `---
fitnessType: ${workoutLog.frontmatter.fitnessType || "workout-log"}
workoutDate: ${workoutLog.frontmatter.workoutDate}
sourceTrainingSplit: ${workoutLog.frontmatter.sourceTrainingSplit}
scheduledDay: ${workoutLog.frontmatter.scheduledDay}
---

# ${workoutLog.title}

Source split: ${workoutLog.sourceTrainingSplit}

## Exercises

${exerciseSections}`;
}

function parseFrontmatter(lines: string[]): WorkoutLogFrontmatter {
	const frontmatter: WorkoutLogFrontmatter = {
		fitnessType: "workout-log",
		workoutDate: "",
		sourceTrainingSplit: "",
		scheduledDay: "",
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

		if (key === "fitnessType" || key === "workoutDate" || key === "sourceTrainingSplit" || key === "scheduledDay") {
			frontmatter[key] = value;
		}
	}

	return frontmatter;
}

function parseSetLine(line: string): WorkoutLogSetEntry | null {
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

function serializeExercise(exercise: WorkoutLogExerciseEntry): string {
	return `### ${exercise.exerciseLink}

Prescription: ${exercise.prescription}
Notes: ${exercise.notes}

${exercise.sets.map(serializeSet).join("\n")}
`;
}

function serializeSet(set: WorkoutLogSetEntry, index: number): string {
	return `- [${set.completed ? "x" : " "}] Set ${index + 1}: weight=${set.weight} reps=${set.reps} rpe=${set.rpe} notes=${set.notes}`;
}
