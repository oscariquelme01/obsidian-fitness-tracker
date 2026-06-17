import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseWorkout } from "../../../../src/workouts/infrastructure/markdown/workout-markdown-parser";

function readFixture(fileName: string): string {
	return readFileSync(`tests/workouts/infrastructure/markdown/fixtures/${fileName}`, "utf8");
}

test("parseWorkout reads workout metadata and exercises", () => {
	const workout = parseWorkout(readFixture("workout-with-exercises.md"));

	assert.deepEqual(workout, {
		date: "2026-06-17",
		title: "Push day",
		sourceTrainingSplit: "[[Push pull legs]]",
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
			{
				exerciseName: "lat-pulldown",
				prescription: "2 sets | 12 reps",
				notes: "",
				sets: [
					{ completed: false, weight: "60", reps: "12", rpe: "7", notes: "easy" },
				],
			},
		],
	});
});

test("parseWorkout falls back when optional sections are missing", () => {
	const workout = parseWorkout(readFixture("workout-with-no-exercises.md"));

	assert.deepEqual(workout, {
		date: "",
		title: "Workout",
		sourceTrainingSplit: "",
		exercises: [],
	});
});
