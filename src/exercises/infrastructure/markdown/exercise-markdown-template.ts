import { CreateExerciseDto } from "../../application/exercise-dtos";
import { formatYamlList } from "shared/infrastructure/yaml-formatting";
import { EXERCISE_FRONTMATTER_PROPERTY } from "./exercise-frontmatter-properties";

export function createExerciseId(exerciseName: string): string {
	const exerciseId = exerciseName
		.trim()
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return exerciseId || "exercise";
}

export function createExerciseNoteContent(input: CreateExerciseDto): string {
	const exerciseId = createExerciseId(input.name);
	const primaryMuscles = formatYamlList(input.primaryMuscles || []);
	const equipment = formatYamlList(input.equipment || []);

	return `---
${EXERCISE_FRONTMATTER_PROPERTY.exerciseId}: ${exerciseId}
${EXERCISE_FRONTMATTER_PROPERTY.primaryMuscles}: ${primaryMuscles}
${EXERCISE_FRONTMATTER_PROPERTY.secondaryMuscles}: []
${EXERCISE_FRONTMATTER_PROPERTY.equipment}: ${equipment}
${EXERCISE_FRONTMATTER_PROPERTY.optionalEquipment}: []
${EXERCISE_FRONTMATTER_PROPERTY.movementPattern}:
---

### ${input.name}

#### Notes

#### Cues

#### Substitutions
`;
}

export function createExerciseFileName(exerciseName: string): string {
	return exerciseName
		.trim()
		.replace(/[\\/:*?"<>|]/g, "")
		.replace(/\s+/g, " ") || "Exercise";
}
