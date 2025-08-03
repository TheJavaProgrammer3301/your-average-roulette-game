import React, { useMemo } from "@rbxts/react";
import { Divider } from "./SurfaceFrame";
import { RouletteGame } from "./games";

export function getTimeDifference(dateString: string, start = DateTime.now(), suffix = " ago"): string {
	const date = DateTime.fromIsoDate(dateString);
	if (!date) {
		return "Unknown";
	}

	const diffSeconds = start.UnixTimestamp - date.UnixTimestamp;

	if (diffSeconds < 60) {
		return "Just now";
	} else if (diffSeconds < 3600) {
		return `${math.floor(diffSeconds / 60)} minute${math.floor(diffSeconds / 60) === 1 ? "" : "s"}${suffix}`;
	} else if (diffSeconds < 86400) {
		return `${math.floor(diffSeconds / 3600)} hour${math.floor(diffSeconds / 3600) === 1 ? "" : "s"}${suffix}`;
	} else if (diffSeconds < 2592000) { // 30 days
		return `${math.floor(diffSeconds / 86400)} day${math.floor(diffSeconds / 86400) === 1 ? "" : "s"}${suffix}`;
	} else if (diffSeconds < 31536000) { // 365 days
		return `${math.floor(diffSeconds / 2592000)} month${math.floor(diffSeconds / 2592000) === 1 ? "" : "s"}${suffix}`;
	} else {
		return `${math.floor(diffSeconds / 31536000)} year${math.floor(diffSeconds / 31536000) === 1 ? "" : "s"}${suffix}`;
	}
}

function SmallIcon({ iconId }: { iconId: string }) {
	return <imagelabel
		Image={iconId}
		BackgroundTransparency={1}
		Size={UDim2.fromOffset(72, 72)}
	>
		<uiaspectratioconstraint
			AspectRatio={1}
		/>
		<uicorner
			CornerRadius={new UDim(0, 8)}
		/>
	</imagelabel>;
}

function GameMediaDisplay({ media }: { media: RouletteGame["media"] }) {
	return <scrollingframe
		BackgroundTransparency={1}
		BorderSizePixel={0}
		AutomaticCanvasSize={Enum.AutomaticSize.X}
		CanvasSize={UDim2.fromScale(0, 1)}
		ScrollingDirection={Enum.ScrollingDirection.X}
	>
		<uipagelayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			VerticalAlignment={Enum.VerticalAlignment.Top}
			EasingStyle={Enum.EasingStyle.Cubic}
			ScrollWheelInputEnabled={media.size() > 1}
			Circular
		/>
		<uiaspectratioconstraint
			AspectRatio={16 / 9}
			AspectType={Enum.AspectType.ScaleWithParentSize}
			DominantAxis={Enum.DominantAxis.Height}
		/>
		{media.map((item, index) => (
			<imagelabel
				key={index}
				Image={typeIs(item.imageId, "number") ? `rbxassetid://${item.imageId}` : item.imageId}
				Size={UDim2.fromScale(1, 1)}
				BackgroundTransparency={1}
				BorderSizePixel={0}
				ImageColor3={new Color3(1, 1, 1)}
			>
				<textlabel
					Text={item.altText}
					TextColor3={new Color3(1, 1, 1)}
					TextSize={14}
					TextWrapped
					BackgroundTransparency={1}
					Position={UDim2.fromScale(0.5, 0.9)}
					AnchorPoint={new Vector2(0.5, 0.5)}
				/>
				<uiaspectratioconstraint
					AspectRatio={16 / 9}
				/>
				<uicorner
					CornerRadius={new UDim(0, 16)}
				/>
			</imagelabel>
		))}
	</scrollingframe>
}

export default function GameInfoDisplay({ currentGame }: { currentGame: RouletteGame }) {
	const createdAt = useMemo(() => DateTime.fromIsoDate(currentGame.roblox.created)?.FormatUniversalTime("llll", "en-us"), [currentGame]);
	const updatedAt = useMemo(() => DateTime.fromIsoDate(currentGame.roblox.updated)?.FormatUniversalTime("llll", "en-us"), [currentGame]);

	return <>
		<frame
			BackgroundTransparency={1}
			AutomaticSize={Enum.AutomaticSize.Y}
		>
			<uilistlayout
				HorizontalAlignment={Enum.HorizontalAlignment.Left}
				FillDirection={Enum.FillDirection.Horizontal}
			/>
			<textlabel
				AutomaticSize={Enum.AutomaticSize.Y}
				BackgroundTransparency={1}
				Text={`${currentGame.roblox.name}`}
				FontFace={Font.fromId(12187365364)}
				TextColor3={new Color3(1, 1, 1)}
				TextSize={72}
				TextWrapped
				TextXAlignment={Enum.TextXAlignment.Left}
			>
				<uiflexitem
					FlexMode={Enum.UIFlexMode.Grow}
				/>
			</textlabel>
			<SmallIcon iconId={currentGame.iconId} />
		</frame>
		<Divider />
		{currentGame.media.size() > 0 && <GameMediaDisplay media={currentGame.media} />}
		<Divider />
		{currentGame.roblox.description !== undefined && <textlabel
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={`<font color="#ffffff"><b>Description:</b></font> ${currentGame.roblox.description}`}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(0.6, 0.6, 0.6)}
			TextSize={36}
			TextWrapped
			RichText
			TextXAlignment={Enum.TextXAlignment.Left}
		/>}
		<textlabel
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={`<font color="#ffffff"><b>Last updated:</b></font> ${updatedAt} (${getTimeDifference(currentGame.roblox.updated)})`}
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
			Text={`<font color="#ffffff"><b>Created:</b></font> ${createdAt} (${getTimeDifference(currentGame.roblox.created)})`}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(0.6, 0.6, 0.6)}
			TextSize={36}
			TextWrapped
			TextXAlignment={Enum.TextXAlignment.Left}
			RichText
		/>
	</>;
}