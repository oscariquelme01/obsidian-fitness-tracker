import type { WorkoutExercise } from "workouts/domain/workout";
import { WorkoutSetRows } from "./workout-sets";

interface Props {
	exercise: WorkoutExercise;
	exerciseIndex: number;
}

export function WorkoutExerciseComponent({ exercise, exerciseIndex }: Props) {
	return (
		<div className="w-full">
			<div className="flex items-end my-4 justify-between">
				<div className="">
					<h5 className="m-0">{exercise.exerciseName}</h5>
					<div className="text-muted text-sm align-bottom h-full">
						{exercise.prescription}
					</div>
				</div>

				<div>...</div>
			</div>
			<table className="w-full">
				<thead>
					<tr>
						<th>Set</th>
						<th>Previous</th>
						<th>Kg</th>
						<th>Rep</th>
						<th>Done</th>
						<th> </th>
					</tr>
				</thead>
				<tbody>
					<WorkoutSetRows
						sets={exercise.sets}
						exerciseIndex={exerciseIndex}
					/>
				</tbody>
			</table>
			<div className="flex w-full items-center justify-center">
				<button className="rounded-full p-3">+</button>
			</div>
		</div>
	);
}
