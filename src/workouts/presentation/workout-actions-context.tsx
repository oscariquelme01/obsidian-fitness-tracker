import { createContext, useContext } from "react";
import type { Workout } from "workouts/domain/workout";

interface WorkoutActions {
	updateWorkout: (update: (workout: Workout) => Workout) => void;
}

const WorkoutActionsContext = createContext<WorkoutActions | null>(null);

export const WorkoutActionsProvider = WorkoutActionsContext.Provider;

export function useWorkoutActions(): WorkoutActions {
	const actions = useContext(WorkoutActionsContext);

	if (!actions) {
		throw new Error("useWorkoutActions must be used inside WorkoutActionsProvider");
	}

	return actions;
}
