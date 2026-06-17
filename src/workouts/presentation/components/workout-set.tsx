import type { WorkoutSet } from "workouts/domain/workout";

interface WorkoutSetSummaryProps {
	sets: WorkoutSet[];
}

export function WorkoutSetSummary({ sets }: WorkoutSetSummaryProps) {
	if (sets.length === 0) {
		return <span>0 sets</span>;
	}

	const completedSets = sets.filter((set) => set.completed).length;

	return (
		<span>
			{completedSets}/{sets.length} completed
		</span>
	);
}
