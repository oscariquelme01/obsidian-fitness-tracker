import { useEffect, useState } from "react";
import { listExercises } from "exercises/application/list-exercises";
import { ObsidianExerciseRepository } from "exercises/infrastructure/obsidian-exercise-repository";
import { getPlugin } from "shared/infrastructure/plugin-context";
import { AutocompleteInput } from "shared/presentation/components/AutocompleteInput";

interface ExerciseInputProps {
	ariaLabel?: string;
	className?: string;
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	onSelect: (exerciseName: string) => void;
}

export function ExerciseInput({
	ariaLabel = "Search exercises",
	className = "",
	placeholder = "Search exercises",
	value,
	onChange,
	onSelect,
}: ExerciseInputProps) {
	const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);

	useEffect(() => {
		let cancelled = false;

		async function loadExercises() {
			const plugin = getPlugin();
			const exercises = await listExercises(new ObsidianExerciseRepository(plugin.app, plugin.settings));

			if (!cancelled) {
				setExerciseOptions(exercises.map((exercise) => exercise.name));
			}
		}

		void loadExercises().catch((error) => {
			console.error("Failed to load exercises", error);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<AutocompleteInput
			ariaLabel={ariaLabel}
			className={className}
			options={exerciseOptions}
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			onSelect={onSelect}
		/>
	);
}
