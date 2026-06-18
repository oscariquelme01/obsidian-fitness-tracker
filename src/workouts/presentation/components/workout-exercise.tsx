import type { WorkoutExercise } from "workouts/domain/workout";
import { WorkoutSetRows } from "./workout-sets";

interface Props {
	exercise: WorkoutExercise;
	exerciseIndex: number;
}

export function WorkoutExerciseComponent({
	exercise,
	exerciseIndex,
}: Props) {
	return (
		<div className="w-full">
			<h3>{exercise.exerciseName}</h3>
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
					<WorkoutSetRows
						sets={exercise.sets}
						exerciseIndex={exerciseIndex}
					/>
				</tbody>
			</table>
		</div>
	);
}
