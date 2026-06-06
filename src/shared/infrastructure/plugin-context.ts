import type FitnessTrackerPlugin from "../../main";

let plugin: FitnessTrackerPlugin | null = null;

export function setPluginContext(p: FitnessTrackerPlugin): void {
	plugin = p;
}

export function getPlugin(): FitnessTrackerPlugin {
	if (!plugin) {
		throw new Error("Plugin context not initialized");
	}

	return plugin;
}

export function getApp() {
	return getPlugin().app;
}
