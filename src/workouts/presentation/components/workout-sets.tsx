import type { WorkoutSet } from "workouts/domain/workout";

interface Props {
	sets: WorkoutSet[];
}

export function WorkoutSetRows({ sets }: Props) {
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
					<th className="text-center" scope="row">{index + 1}</th>
					<td className="text-center">-</td>
					<td className="text-center">{set.weight || "-"}</td>
					<td className="text-center">{set.reps || "-"}</td>
					<td className="text-center">
						<input type="checkbox" checked={set.completed} readOnly />
					</td>
				</tr>
			))}
		</>
	);
}
