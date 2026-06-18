import { Badge } from "shared/presentation/components/Badge";
import { ContextMenu } from "shared/presentation/components/Context-menu";
import type { WorkoutSet, WorkoutSetType } from "workouts/domain/workout";

interface Props {
	sets: WorkoutSet[];
	onCompletedChange: (setIndex: number, completed: boolean) => void;
	onTypeChange: (setIndex: number, type: WorkoutSetType) => void;
}

export function WorkoutSetRows({ sets, onCompletedChange, onTypeChange }: Props) {
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
							onChange={(type) => onTypeChange(index, type)}
						/>
					</th>
					<td className="text-center">-</td>
					<td className="text-center">{set.weight || "-"}</td>
					<td className="text-center">{set.reps || "-"}</td>
					<td className="text-center">
						<input
							type="checkbox"
							checked={set.completed}
							onChange={(event) => onCompletedChange(index, event.currentTarget.checked)}
						/>
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
				{ key: "normal", label: <Badge flavour="secondary">-</Badge>, onSelect: () => onChange("normal") },
				{ key: "warmup", label: <Badge flavour="success">W</Badge>, onSelect: () => onChange("warmup") },
				{ key: "failure", label: <Badge flavour="danger">F</Badge>, onSelect: () => onChange("failure") },
			]}
		/>
	);
}

function WorkoutSetTypeBadge({ setNumber, type }: { setNumber: number; type: WorkoutSetType }) {
	if (type === "failure") {
		return <Badge flavour="danger">{setNumber} F</Badge>;
	}

	if (type === "warmup") {
		return <Badge flavour="success">{setNumber} W</Badge>;
	}

	return <Badge flavour="secondary">{setNumber}</Badge>;
}
