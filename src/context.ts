import type FitnessTrackerPlugin from "./main";

let plugin: FitnessTrackerPlugin | null = null;

export function setPluginContext(p: FitnessTrackerPlugin) {
	plugin = p;
}

export function getPlugin() {
	if (!plugin) throw new Error("Plugin context not initialized");
	return plugin;
}

export function getApp() {
	return getPlugin().app;
}
