import { Exercise } from "../../domain/exercise";
import { readFrontmatterStringList } from "shared/infrastructure/yaml-parsing";
import { EXERCISE_FRONTMATTER_PROPERTY } from "./exercise-frontmatter-properties";

export interface ExerciseMarkdownParseInput {
	basename: string;
	frontmatter?: Record<string, unknown>;
}

export function parseExerciseFromMarkdownFile(input: ExerciseMarkdownParseInput): Exercise {
	return {
		name: input.basename,
		primaryMuscles: readFrontmatterStringList(input.frontmatter?.[EXERCISE_FRONTMATTER_PROPERTY.primaryMuscles]),
		equipment: readFrontmatterStringList(input.frontmatter?.[EXERCISE_FRONTMATTER_PROPERTY.equipment]),
	};
}
