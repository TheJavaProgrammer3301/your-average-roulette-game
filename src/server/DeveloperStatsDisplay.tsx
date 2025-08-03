import Object from "@rbxts/object-utils";
import React, { useEffect, useMemo } from "@rbxts/react";
import { getTimeDifference } from "./GameInfoDisplay";
import { GameVersion, RouletteGame } from "./games";
import importDate from "./import-date";

function getVersionLabel(version: GameVersion) {
	return `version #${version.assetVersionNumber} (saved ${importDate(version.created)}, ${getTimeDifference(version.created)})`;
}

function isLeapYear(year: number) {
	return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(year: number, month: number) {
	// Month is 1-based (1 = January, 12 = December)
	const daysInMonth = [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	return daysInMonth[month - 1];
}

const CHART_BAR_WIDTH = 32;
const WEEKS_PER_MONTH = 5;
const MIN_MAX_VERSIONS = 10;

function VersionsChartBar({ weekIndex, versions, max }: { weekIndex: string; versions: GameVersion[]; max: number }) {
	const totalVersions = versions.size();
	const [startOfWeek, endOfWeek] = useMemo(() => {
		const [year, month, week] = weekIndex.split("-").map(val => tonumber(val));

		return [
			DateTime.fromUniversalTime(year, month, math.min(getDaysInMonth(year!, month!), (week! - 1) * 7 + 1), 0, 0, 0).FormatUniversalTime("M/D", "en-us"),
			DateTime.fromUniversalTime(year, month, math.min(getDaysInMonth(year!, month!), (week! - 1) * 7 + 7), 0, 0, 0).FormatUniversalTime("M/D", "en-us"),
		];
	}, [weekIndex]);

	return <imagelabel
		Size={UDim2.fromScale(1 / WEEKS_PER_MONTH, totalVersions / max)}
		ImageColor3={Color3.fromRGB(12, 207, 135)}
		Image={"rbxassetid://71122722556269"}
		ScaleType={Enum.ScaleType.Slice}
		BackgroundTransparency={1}
		SliceCenter={new Rect(120, 120, 120, 120)}
		SliceScale={0.1}
		ClipsDescendants
	>
		<textlabel
			Size={UDim2.fromScale(1, 1)}
			BackgroundTransparency={1}
			Text={`${totalVersions}\n${startOfWeek}-${endOfWeek}`}
			FontFace={Font.fromId(12187365364, Enum.FontWeight.Bold)}
			Visible={totalVersions > 0}
			TextColor3={new Color3(0.2, 0.2, 0.2)}
			TextSize={24}
			TextXAlignment={Enum.TextXAlignment.Center}
			TextWrapped
			TextYAlignment={Enum.TextYAlignment.Top}
		>
			<uipadding
				PaddingRight={new UDim(0, 8)}
				PaddingLeft={new UDim(0, 8)}
				PaddingTop={new UDim(0, 4)}
				PaddingBottom={new UDim(0, 4)}
			/>
		</textlabel>
	</imagelabel>;
}

function VersionsChartSection({ sectionIndex, section, max }: { sectionIndex: number; section: { [key: string]: GameVersion[] }; max: number }) {
	const formattedDate = useMemo(() => {
		let year = math.floor(sectionIndex / 12);
		let month = sectionIndex % 12;

		if (month === 0) {
			year -= 1;
			month = 12;
		}

		// Create a DateTime object for the first day of that month/year
		return DateTime.fromUniversalTime(year, month, 1, 0, 0, 0).FormatUniversalTime("MMM YYYY", "en-us");;
	}, [sectionIndex]);

	return <frame
		Size={UDim2.fromOffset(48 * WEEKS_PER_MONTH)}
		BackgroundTransparency={1}
	>
		<frame
			BackgroundColor3={new Color3(0.2, 0.2, 0.2)}
			BorderSizePixel={2}
			BorderMode={Enum.BorderMode.Middle}
			BorderColor3={new Color3(0.6, 0.6, 0.6)}
		>
			<uiflexitem
				FlexMode={Enum.UIFlexMode.Grow}
			/>
			<uilistlayout
				FillDirection={Enum.FillDirection.Horizontal}
				HorizontalAlignment={Enum.HorizontalAlignment.Center}
				VerticalAlignment={Enum.VerticalAlignment.Bottom}
			/>
			{Object.keys(section).map((weekKey) => (
				<VersionsChartBar key={weekKey} weekIndex={weekKey as string} versions={section[weekKey]} max={max} />
			))}
		</frame>
		<textlabel
			Size={UDim2.fromOffset(0, 48)}
			BackgroundTransparency={1}
			Text={`<font color="#ffffff"><b>${formattedDate}</b></font>`}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(0.6, 0.6, 0.6)}
			TextSize={24}
			TextXAlignment={Enum.TextXAlignment.Center}
			RichText
		/>
		<uiflexitem
			FlexMode={Enum.UIFlexMode.Grow}
		/>
		<uilistlayout
			FillDirection={Enum.FillDirection.Vertical}
			HorizontalFlex={Enum.UIFlexAlignment.Fill}
		/>
	</frame>;
}

function VersionsChart({ versions }: { versions: GameVersion[] }) {
	const startDate = useMemo(() => {
		const startDateTime = DateTime.fromIsoDate(versions[versions.size() - 1].created)!.ToUniversalTime();

		return startDateTime.Year * 12 + startDateTime.Month;
	}, [versions]);

	const endDate = useMemo(() => {
		const endDateTime = DateTime.fromIsoDate(versions[0].created)!.ToUniversalTime();

		return endDateTime.Year * 12 + endDateTime.Month;
	}, [versions]);

	const sections = useMemo(() => {
		const sections: { [key: number]: GameVersion[] } = {};
		for (let i = startDate; i <= endDate; i++) {
			sections[i] = [];
		}

		for (const version of versions) {
			const dateTime = DateTime.fromIsoDate(version.created)!.ToUniversalTime();
			const key = dateTime.Year * 12 + dateTime.Month;

			if (dateTime.Month === 0) print(version.created, dateTime);

			sections[key].push(version);
		}

		return sections;
	}, [startDate, endDate, versions]);

	const bars = useMemo(() => {
		const bars: { [key: string]: { [key: string]: GameVersion[] } } = {};

		for (const [key, versions] of Object.entries(sections)) {
			let year = math.floor(key / 12);
			let month = key % 12;

			if (month === 0) {
				year -= 1;
				month = 12;
			}

			const sets: { [key: string]: GameVersion[] } = {};

			for (let i = 1; i <= WEEKS_PER_MONTH; i++) {
				const weekKey = `${year}-${month}-${i}`;

				sets[weekKey] = [];
			}

			for (const version of versions) {
				const dateTime = DateTime.fromIsoDate(version.created)!.ToUniversalTime();
				const weekKey = `${dateTime.Year}-${dateTime.Month}-${math.ceil(dateTime.Day / 7)}`;

				sets[weekKey] = [...sets[weekKey] ?? [], version];
			}

			bars[key] = sets;
		}

		return bars;
	}, [sections]);

	const max = useMemo(() => math.max(MIN_MAX_VERSIONS, math.floor(Object.values(bars).reduce((max, section) => {
		const sectionMax = Object.values(section).reduce((sectionMax, versions) => math.max(sectionMax, versions.size()), 0);
		return math.max(max, sectionMax);
	}, 0) * 1.5)), [bars]);

	return <scrollingframe
		BackgroundTransparency={1}
		Size={UDim2.fromOffset(0, 384)}
		ScrollingDirection={Enum.ScrollingDirection.X}
		CanvasSize={UDim2.fromScale(0, 0)}
		BorderSizePixel={0}
		AutomaticCanvasSize={Enum.AutomaticSize.X}
		HorizontalScrollBarInset={Enum.ScrollBarInset.ScrollBar}
		BottomImage={"rbxassetid://82235059621176"}
		MidImage={"rbxassetid://136648380072342"}
		TopImage={"rbxassetid://101530530742914"}
		ScrollBarImageColor3={new Color3(0.6, 0.6, 0.6)}
	>
		<uilistlayout
			FillDirection={Enum.FillDirection.Horizontal}
			VerticalFlex={Enum.UIFlexAlignment.Fill}
		/>
		{Object.keys(sections).map((key) => <VersionsChartSection key={key} sectionIndex={key} section={bars[key]} max={max} />)}
	</scrollingframe>;
}

export default function DeveloperStatsDisplay({ currentGame }: { currentGame: RouletteGame }) {
	const { versions } = currentGame;

	useEffect(() => {
		versions.sort((a, b) => DateTime.fromIsoDate(b.created)!.UnixTimestampMillis < DateTime.fromIsoDate(a.created)!.UnixTimestampMillis);
	}, [versions]);

	const lastSavedVersion = useMemo(() => versions[0], [versions]);
	const lastPublishedVersion = useMemo(() => versions.find(v => v.isPublished), [versions]);

	const lastSavedLabel = useMemo(() => getVersionLabel(lastSavedVersion), [lastSavedVersion]);
	const lastPublishedLabel = useMemo(() => lastPublishedVersion ? getVersionLabel(lastPublishedVersion) : "None", [lastPublishedVersion]);

	const statusLabel = useMemo(() => !lastPublishedVersion ? "Never published" : lastSavedVersion === lastPublishedVersion ? "Up to date" : `Out of date by ${lastSavedVersion.assetVersionNumber - lastPublishedVersion.assetVersionNumber} versions and ${getTimeDifference(lastPublishedVersion.created, DateTime.fromIsoDate(lastSavedVersion.created), "")}`, [lastSavedVersion, lastPublishedVersion]);

	return <>
		<textlabel
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={`<font color="#ffffff"><b>Status:</b></font> ${statusLabel}`}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(0.6, 0.6, 0.6)}
			TextSize={36}
			TextWrapped
			TextXAlignment={Enum.TextXAlignment.Left}
			RichText
		/>
		<textlabel
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={`<font color="#ffffff"><b>Last saved version:</b></font> ${lastSavedLabel}`}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(0.6, 0.6, 0.6)}
			TextSize={36}
			TextWrapped
			TextXAlignment={Enum.TextXAlignment.Left}
			RichText
		/>
		<textlabel
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={`<font color="#ffffff"><b>Last published version:</b></font> ${lastPublishedLabel}`}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(0.6, 0.6, 0.6)}
			TextSize={36}
			TextWrapped
			TextXAlignment={Enum.TextXAlignment.Left}
			RichText
		/>
		<VersionsChart versions={versions} />
	</>;
}
