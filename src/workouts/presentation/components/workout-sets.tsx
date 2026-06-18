import { Badge } from "shared/presentation/components/Badge";
import { ContextMenu } from "shared/presentation/components/Context-menu";
import type { ComponentPropsWithoutRef } from "react";
import type { WorkoutSet, WorkoutSetType } from "workouts/domain/workout";
import { useWorkoutActions } from "../workout-actions-context";
import { Icon } from "shared/presentation/components/Icon";

interface Props {
	sets: WorkoutSet[];
	exerciseIndex: number;
}

export function WorkoutSetRows({ sets, exerciseIndex }: Props) {
	const { updateWorkout } = useWorkoutActions();

	function updateSet(
		setIndex: number,
		changes: { completed?: boolean; type?: WorkoutSetType },
	) {
		updateWorkout((workout) => ({
			...workout,
			exercises: workout.exercises.map(
				(exercise, currentExerciseIndex) => {
					if (currentExerciseIndex !== exerciseIndex) {
						return exercise;
					}

					return {
						...exercise,
						sets: exercise.sets.map((set, currentSetIndex) => {
							return currentSetIndex === setIndex
								? { ...set, ...changes }
								: set;
						}),
					};
				},
			),
		}));
	}

	if (sets.length === 0) {
		return (
			<tr>
				<td colSpan={5}>No sets logged.</td>
			</tr>
		);
	}

	return (
		<>
			{sets.map((set, index) => (
				<tr key={index}>
					<th className="text-center" scope="row">
						<WorkoutSetTypeMenu
							setNumber={index + 1}
							type={set.type || "normal"}
							onChange={(type) => updateSet(index, { type })}
						/>
					</th>
					<td className="text-center">-</td>
					<td className="text-center">{set.weight || "-"}</td>
					<td className="text-center">{set.reps || "-"}</td>
					<td className="text-center">
						<input
							type="checkbox"
							checked={set.completed}
							onChange={(event) => {
								updateSet(index, {
									completed: event.currentTarget.checked,
								});
							}}
						/>
					</td>
					<td>
						<button className="!border-0 !bg-transparent !shadow-none hover:!bg-transparent">
							<Icon name="trash" className="text-ctp-red" />
						</button>
					</td>
				</tr>
			))}
		</>
	);
}

function WorkoutSetTypeMenu({
	setNumber,
	type,
	onChange,
}: {
	setNumber: number;
	type: WorkoutSetType;
	onChange: (type: WorkoutSetType) => void;
}) {
	return (
		<ContextMenu
			trigger={<WorkoutSetTypeBadge setNumber={setNumber} type={type} />}
			items={[
				{
					key: "normal",
					label: <Badge flavour="secondary">-</Badge>,
					onSelect: () => onChange("normal"),
				},
				{
					key: "warmup",
					label: <Badge flavour="success">W</Badge>,
					onSelect: () => onChange("warmup"),
				},
				{
					key: "failure",
					label: <Badge flavour="danger">F</Badge>,
					onSelect: () => onChange("failure"),
				},
			]}
		/>
	);
}

interface WorkoutSetTypeBadgeProps extends ComponentPropsWithoutRef<"span"> {
	setNumber: number;
	type: WorkoutSetType;
}

function WorkoutSetTypeBadge({
	setNumber,
	type,
	...spanProps
}: WorkoutSetTypeBadgeProps) {
	if (type === "failure") {
		return (
			<Badge {...spanProps} flavour="danger">
				F
			</Badge>
		);
	}

	if (type === "warmup") {
		return (
			<Badge {...spanProps} flavour="success">
				W
			</Badge>
		);
	}

	return (
		<Badge {...spanProps} flavour="secondary">
			{setNumber}
		</Badge>
	);
}
