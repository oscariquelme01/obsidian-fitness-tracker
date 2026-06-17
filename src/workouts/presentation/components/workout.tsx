import type { Workout } from "workouts/domain/workout";
import { WorkoutExerciseRow } from "./workout-exercise";

interface WorkoutComponentProps {
	workout: Workout | null;
}

export function WorkoutComponent({ workout }: WorkoutComponentProps) {
	if (!workout) {
		return <p>Loading workout...</p>;
	}

	return (
		<section>
			<header>
				<h1>{workout.title}</h1>
				<p>{workout.date}</p>
			</header>

			<table>
				<thead>
					<tr>
						<th scope="col">Exercise</th>
						<th scope="col">Prescription</th>
						<th scope="col">Sets</th>
						<th scope="col">Notes</th>
					</tr>
				</thead>
				<tbody>
					{workout.exercises.length > 0 ? (
						workout.exercises.map((exercise) => (
							<WorkoutExerciseRow key={exercise.exerciseName} exercise={exercise} />
						))
					) : (
						<tr>
							<td colSpan={4}>No exercises scheduled.</td>
						</tr>
					)}
				</tbody>
			</table>
		</section>
	);
}
