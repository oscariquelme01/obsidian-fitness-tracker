import { escapeDoubleQuotedString } from "shared/domain/strings";
import { EXERCISE_FRONTMATTER_PROPERTY } from "./exercise-frontmatter-properties";

export function createExerciseLibraryViewContent(exerciseFolder: string): string {
	return `views:
  - type: table
    name: Table
    filters:
      and:
        - file.inFolder("${escapeDoubleQuotedString(exerciseFolder)}")
    order:
      - file.name
      - ${EXERCISE_FRONTMATTER_PROPERTY.movementPattern}
      - ${EXERCISE_FRONTMATTER_PROPERTY.equipment}
      - ${EXERCISE_FRONTMATTER_PROPERTY.primaryMuscles}
      - ${EXERCISE_FRONTMATTER_PROPERTY.secondaryMuscles}
      - ${EXERCISE_FRONTMATTER_PROPERTY.exerciseId}
    sort:
      - property: ${EXERCISE_FRONTMATTER_PROPERTY.movementPattern}
        direction: ASC`;
}
