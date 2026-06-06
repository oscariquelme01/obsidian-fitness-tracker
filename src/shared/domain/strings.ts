export function slugify(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function escapeDoubleQuotedString(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
