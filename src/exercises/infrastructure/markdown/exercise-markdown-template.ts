import { CreateExerciseDto } from "../../application/exercise-dtos";

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
exerciseId: ${exerciseId}
primaryMuscles: ${primaryMuscles}
secondaryMuscles: []
equipment: ${equipment}
optionalEquipment: []
movementPattern:
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

function formatYamlList(values: string[]): string {
	const cleanValues = values.map((value) => value.trim()).filter(Boolean);

	return cleanValues.length > 0 ? `[${cleanValues.join(", ")}]` : "[]";
}
