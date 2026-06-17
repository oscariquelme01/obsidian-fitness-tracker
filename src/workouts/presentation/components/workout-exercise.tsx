import type { WorkoutExercise } from "workouts/domain/workout";
import { WorkoutSetRows } from "./workout-sets";

interface Props {
	exercise: WorkoutExercise;
}

export function WorkoutExerciseComponent({ exercise }: Props) {
	return (
		<div className="w-full">
			<h4>{exercise.exerciseName}</h4>
			<table className="w-full">
				<thead>
					<tr>
						<th>Set</th>
						<th>Previous</th>
						<th>Kg</th>
						<th>Rep</th>
						<th>Done</th>
					</tr>
				</thead>
				<tbody>
					<WorkoutSetRows sets={exercise.sets} />
				</tbody>
			</table>
		</div>
	);
}
