export function readFrontmatterStringList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.filter((item): item is string => typeof item === "string")
			.map((item) => item.trim())
			.filter(Boolean);
	}

	if (typeof value === "string") {
		const cleanValue = value.trim();

		return cleanValue ? [cleanValue] : [];
	}

	return [];
}
