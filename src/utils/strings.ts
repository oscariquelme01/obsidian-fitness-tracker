export function escapeDoubleQuotedString(value: string): string {
	return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
