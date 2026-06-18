import type { Workout } from "workouts/domain/workout";
import { WorkoutExerciseComponent } from "./workout-exercise";
import Divider from "shared/presentation/components/Divider";

interface Props {
	workout: Workout | null;
}

export function WorkoutComponent({ workout }: Props) {
	if (!workout) {
		return <p>Loading workout...</p>;
	}

	return (
		<section className="max-w-md w-full">
			<header>
				<h1 className="text-2xl">
					{workout.title} - {workout.date}
				</h1>
			</header>

			<Divider/>

			{workout.exercises.length > 0 ? (
				workout.exercises.map((exercise, exerciseIndex) => (
					<WorkoutExerciseComponent
						key={exercise.exerciseName}
						exercise={exercise}
						exerciseIndex={exerciseIndex}
					/>
				))
			) : 'No Excercise Scheduled'}
		</section>
	);
}
