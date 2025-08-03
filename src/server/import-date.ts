export default function importDate(date: string) {
	return DateTime.fromIsoDate(date)?.FormatUniversalTime("llll", "en-us");
}