import { escapeDoubleQuotedString } from "shared/domain/strings";

export function createExerciseLibraryViewContent(exerciseFolder: string): string {
	return `views:
  - type: table
    name: Table
    filters:
      and:
        - file.inFolder("${escapeDoubleQuotedString(exerciseFolder)}")
    order:
      - file.name
      - movementPattern
      - equipment
      - primaryMuscles
      - secondaryMuscles
      - exerciseId
    sort:
      - property: movementPattern
        direction: ASC`;
}
