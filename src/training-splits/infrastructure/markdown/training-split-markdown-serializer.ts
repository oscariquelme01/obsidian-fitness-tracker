import { TrainingSplit, TrainingSplitDay, TrainingSplitExercise } from "../../domain/training-split";
import { formatYamlFrontmatter } from "shared/infrastructure/yaml-formatting";

export function serializeTrainingSplit(split: TrainingSplit): string {
	return `${serializeFrontmatter(split.frontmatter)}

# ${split.title}

Use \`## Monday: Push day\` headings and exercise bullets formatted as \`- [[Exercise]] | 3 sets | 8 reps | RPE 8\`.

${split.days.map(serializeDay).join("\n")}`;
}

function serializeFrontmatter(frontmatter: Record<string, string>): string {
	const data = { ...frontmatter, fitnessType: frontmatter.fitnessType || "training-split" };

	return formatYamlFrontmatter(data);
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
