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

export function createExerciseNoteContent(exerciseName: string): string {
	const exerciseId = createExerciseId(exerciseName);

	return `---
exerciseId: ${exerciseId}
primaryMuscles: []
secondaryMuscles: []
equipment: []
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
