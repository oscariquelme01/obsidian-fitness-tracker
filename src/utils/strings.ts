export function escapeDoubleQuotedString(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function slugify(value: string): string {
	const slug = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return slug
}
