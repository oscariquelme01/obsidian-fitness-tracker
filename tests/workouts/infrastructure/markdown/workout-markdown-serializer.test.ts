import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { serializeWorkout } from "../../../../src/workouts/infrastructure/markdown/workout-markdown-serializer";
import { parseWorkout } from "../../../../src/workouts/infrastructure/markdown/workout-markdown-parser";
import type { Workout } from "../../../../src/workouts/domain/workout";

function readFixture(fileName: string): string {
	return readFileSync(`tests/workouts/infrastructure/markdown/fixtures/${fileName}`, "utf8");
}

test("serializeWorkout writes workout markdown", () => {
	const markdown = serializeWorkout({
		date: "2026-06-17",
		title: "Push day",
		sourceTrainingSplit: "Push pull legs",
		exercises: [
			{
				exerciseName: "Bench press",
				prescription: "3 sets | 8 reps | RPE 8",
				notes: "Keep shoulders tight",
				sets: [
					{ completed: true, weight: "100", reps: "8", rpe: "8", notes: "solid" },
					{ completed: false, weight: "102.5", reps: "7", rpe: "8.5", notes: "" },
				],
			},
		],
	});

	assert.equal(markdown, readFixture("serialized-workout-with-exercise.md"));
});

test("serializeWorkout and parseWorkout round-trip workout data", () => {
	const workout: Workout = {
		date: "2026-06-17",
		title: "Pull day",
		sourceTrainingSplit: "Push pull legs",
		exercises: [
			{
				exerciseName: "Lat pulldown",
				prescription: "4 sets | 10 reps",
				notes: "Controlled eccentric",
				sets: [
					{ completed: false, weight: "60", reps: "10", rpe: "7", notes: "" },
				],
			},
		],
	};

	assert.deepEqual(parseWorkout(serializeWorkout(workout)), workout);
});
