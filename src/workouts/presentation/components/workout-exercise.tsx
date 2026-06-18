import type { WorkoutExercise, WorkoutSetType } from "workouts/domain/workout";
import { WorkoutSetRows } from "./workout-sets";

interface Props {
	exercise: WorkoutExercise;
	exerciseIndex: number;
	onSetCompletedChange: (exerciseIndex: number, setIndex: number, completed: boolean) => void;
	onSetTypeChange: (exerciseIndex: number, setIndex: number, type: WorkoutSetType) => void;
}

export function WorkoutExerciseComponent({
	exercise,
	exerciseIndex,
	onSetCompletedChange,
	onSetTypeChange,
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
						onCompletedChange={(setIndex, completed) => {
							onSetCompletedChange(exerciseIndex, setIndex, completed);
						}}
						onTypeChange={(setIndex, type) => {
							onSetTypeChange(exerciseIndex, setIndex, type);
						}}
					/>
				</tbody>
			</table>
		</div>
	);
}
