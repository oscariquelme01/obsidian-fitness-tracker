import type { WorkoutExercise } from "workouts/domain/workout";
import { WorkoutSetSummary } from "./workout-set";

interface WorkoutExerciseRowProps {
	exercise: WorkoutExercise;
}

export function WorkoutExerciseRow({ exercise }: WorkoutExerciseRowProps) {
	return (
		<tr>
			<th scope="row">{exercise.exerciseName}</th>
			<td>{exercise.prescription || "-"}</td>
			<td>
				<WorkoutSetSummary sets={exercise.sets} />
			</td>
			<td>{exercise.notes || "-"}</td>
		</tr>
	);
}
