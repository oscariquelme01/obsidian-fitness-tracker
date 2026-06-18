import { useState } from "react";
import type { WorkoutExercise, WorkoutSet } from "workouts/domain/workout";
import { WorkoutSetRows } from "./workout-sets";
import { Icon } from "shared/presentation/components/Icon";
import { useWorkoutActions } from "../workout-actions-context";
import { ContextMenu } from "shared/presentation/components/Context-menu";
import { Modal } from "shared/presentation/components/Modal";

interface Props {
	exercise: WorkoutExercise;
	exerciseIndex: number;
}

export function WorkoutExerciseComponent({ exercise, exerciseIndex }: Props) {
	const { updateWorkout } = useWorkoutActions();
	const [swapExerciseModalOpen, setSwapExerciseModalOpen] = useState(false);

	function addSet() {
		const newSet: WorkoutSet = {
			completed: false,
			type: "normal",
			weight: "",
			reps: "",
			rpe: "",
			notes: "",
		};

		updateWorkout((workout) => ({
			...workout,
			exercises: workout.exercises.map((currentExercise, currentExerciseIndex) => {
				if (currentExerciseIndex !== exerciseIndex) {
					return currentExercise;
				}

				return {
					...currentExercise,
					sets: [...currentExercise.sets, newSet],
				};
			}),
		}));
	}

	function deleteExercise() {
		updateWorkout((workout) => ({
			...workout,
			exercises: workout.exercises.filter((_, currentExerciseIndex) => {
				return currentExerciseIndex !== exerciseIndex;
			}),
		}));
	}

	return (
		<div className="w-full">
			<div className="flex items-end my-4 justify-between">
				<div className="">
					<h5 className="m-0">{exercise.exerciseName}</h5>
					<div className="text-muted text-sm align-bottom h-full">
						{exercise.prescription}
					</div>
				</div>

				<ContextMenu
					trigger={
						<button
							type="button"
							aria-label="Open exercise actions"
							className="!border-0 !bg-transparent !shadow-none hover:!bg-transparent"
						>
							<Icon name="more-vertical"/>
						</button>
					}
					items={[
						{
							key: "swap-exercise",
							label: "Swap exercise",
							onSelect: () => setSwapExerciseModalOpen(true),
						},
						{
							key: "delete-exercise",
							label: "Delete exercise",
							onSelect: deleteExercise,
						},
					]}
				/>
			</div>

			{swapExerciseModalOpen && (
				<Modal title="Swap exercise" onClose={() => setSwapExerciseModalOpen(false)}>
					<p className="m-0 text-muted">Exercise search goes here.</p>
				</Modal>
			)}

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
				<button
					type="button"
					aria-label={`Add set to ${exercise.exerciseName}`}
					className="!border-0 !bg-transparent !shadow-none hover:!bg-transparent"
					onClick={addSet}
				>
					<Icon name="plus"/>
				</button>
			</div>
		</div>
	);
}
