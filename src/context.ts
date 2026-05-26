import type MyPlugin from "./main";

let plugin: MyPlugin | null = null;

export function setPluginContext(p: MyPlugin) {
  plugin = p;
}

export function getPlugin() {
  if (!plugin) throw new Error("Plugin context not initialized");
  return plugin;
}

export function getApp() {
  return getPlugin().app;
}
