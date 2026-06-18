import { StrictMode } from "react";
import { WorkoutComponent } from "./components/workout";

import { TextFileView, WorkspaceLeaf } from "obsidian";
import { parseWorkout } from "../infrastructure/markdown/workout-markdown-parser";
import { serializeWorkout } from "../infrastructure/markdown/workout-markdown-serializer";
import { Workout } from "../domain/workout";
import { Root, createRoot } from "react-dom/client";
import { WorkoutActionsProvider } from "./workout-actions-context";

export const WORKOUT_VIEW_TYPE = "fitness-workout";

export class WorkoutView extends TextFileView {
	private root: Root | null = null;
	private reactContainerEl: HTMLElement | null = null;

	private workout: Workout | null = null;
	private rawData = "";

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return WORKOUT_VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.file?.basename || "Workout";
	}

	getIcon(): string {
		return "calendar-check";
	}

	getViewData(): string {
		return this.workout ? serializeWorkout(this.workout) : this.rawData;
	}

	// NOTE: data = contents of the file in md format
	setViewData(data: string, _: boolean): void {
		this.rawData = data;
		this.workout = parseWorkout(data);
		this.renderReact();
	}

	clear(): void {
		this.workout = null;
		this.rawData = "";
	}

	async onClose() {
		this.root?.unmount();
		this.root = null;
		this.reactContainerEl = null;
		this.contentEl.empty();
	}

	private renderReact(): void {
		if (!this.root) {
			this.reactContainerEl = this.contentEl.createDiv();
			this.reactContainerEl.addClasses(['flex', 'items-center', 'flex-col', 'justify-center'])
			this.root = createRoot(this.reactContainerEl);
		}

		this.root?.render(
			<StrictMode>
				<WorkoutActionsProvider value={{ updateWorkout: this.updateWorkout }}>
					<WorkoutComponent workout={this.workout} />
				</WorkoutActionsProvider>
			</StrictMode>
		);
	}

	private updateWorkout = (update: (workout: Workout) => Workout): void => {
		if (!this.workout) {
			return;
		}

		this.workout = update(this.workout);
		this.rawData = serializeWorkout(this.workout);
		this.requestSave();
		this.renderReact();
	};
}
