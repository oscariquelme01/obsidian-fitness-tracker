export type YamlValue = string | string[];

export function formatYamlList(values: string[]): string {
	const cleanValues = values.map((value) => value.trim()).filter(Boolean);

	return cleanValues.length > 0 ? `[${cleanValues.join(", ")}]` : "[]";
}

export function formatYamlFrontmatter(data: Record<string, YamlValue>): string {
	const lines = Object.entries(data).map(([key, value]) => {
		return `${key}: ${Array.isArray(value) ? formatYamlList(value) : value}`;
	});

	return `---\n${lines.join("\n")}\n---`;
}
