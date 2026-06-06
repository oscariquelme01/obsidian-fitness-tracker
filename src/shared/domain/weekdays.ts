const WEEK_DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

export function getWeekdayName(date: Date): string {
	return WEEK_DAYS[date.getDay()] || "";
}
