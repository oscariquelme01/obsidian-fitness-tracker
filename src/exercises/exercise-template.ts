// TODO: for future me, harcoding a template in code is, to say the least, curious...

export function createExerciseId(exerciseName: string): string {
	const exerciseId = exerciseName
		.trim()
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return exerciseId || "exercise";
}

export interface ExerciseNoteOptions {
	primaryMuscles?: string[];
	equipment?: string[];
}

export function createExerciseNoteContent(exerciseName: string, options: ExerciseNoteOptions = {}): string {
	const exerciseId = createExerciseId(exerciseName);
	const primaryMuscles = formatYamlList(options.primaryMuscles || []);
	const equipment = formatYamlList(options.equipment || []);

	return `---
exerciseId: ${exerciseId}
primaryMuscles: ${primaryMuscles}
secondaryMuscles: []
equipment: ${equipment}
optionalEquipment: []
movementPattern:
---

### ${exerciseName}

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
