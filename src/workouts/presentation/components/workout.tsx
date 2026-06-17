import type { Workout } from "workouts/domain/workout";
import { WorkoutExerciseComponent } from "./workout-exercise";

interface Props {
	workout: Workout | null;
}

export function WorkoutComponent({ workout }: Props) {
	if (!workout) {
		return <p>Loading workout...</p>;
	}

	return (
		<section>
			<header>
				<h3>
					{workout.title} - {workout.date}
				</h3>
			</header>

			{workout.exercises.length > 0 ? (
				workout.exercises.map((exercise) => (
					<WorkoutExerciseComponent
						key={exercise.exerciseName}
						exercise={exercise}
					/>
				))
			) : 'No Excercise Scheduled'}
		</section>
	);
}
