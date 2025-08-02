import React, { useEffect, useMemo, useRef } from "@rbxts/react";
import { getGame, RouletteGame } from "./games";
import { teleportPlayers } from "./teleports";

function getParsedTimeAgo(dateString: string): string {
	const date = DateTime.fromIsoDate(dateString);
	if (!date) {
		return "Unknown";
	}

	const now = DateTime.now();
	const diffSeconds = now.UnixTimestamp - date.UnixTimestamp;

	if (diffSeconds < 60) {
		return "Just now";
	} else if (diffSeconds < 3600) {
		return `${math.floor(diffSeconds / 60)} minutes ago`;
	} else if (diffSeconds < 86400) {
		return `${math.floor(diffSeconds / 3600)} hours ago`;
	} else if (diffSeconds < 2592000) { // 30 days
		return `${math.floor(diffSeconds / 86400)} days ago`;
	} else if (diffSeconds < 31536000) { // 365 days
		return `${math.floor(diffSeconds / 2592000)} months ago`;
	} else {
		return `${math.floor(diffSeconds / 31536000)} years ago`;
	}
}

function Divider() {
	return <frame Size={UDim2.fromOffset(0, 32)} BackgroundTransparency={1}>
		<frame Size={new UDim2(1, 0, 0, 1)} AnchorPoint={new Vector2(0.5, 0.5)} Position={UDim2.fromScale(0.5, 0.5)} BorderSizePixel={0} BackgroundColor3={new Color3(0.5, 0.5, 0.5)} />
	</frame>;
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

function GameInfo({ nextGame }: { nextGame: RouletteGame }) {
	const createdAt = useMemo(() => DateTime.fromIsoDate(nextGame.roblox.created)?.FormatUniversalTime("llll", "en-us"), [nextGame]);
	const updatedAt = useMemo(() => DateTime.fromIsoDate(nextGame.roblox.updated)?.FormatUniversalTime("llll", "en-us"), [nextGame]);

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
				Text={`${nextGame.roblox.name}`}
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
			<SmallIcon iconId={nextGame.iconId} />
		</frame>
		<Divider />
		{nextGame.media.size() > 0 && <GameMediaDisplay media={nextGame.media} />}
		<Divider />
		<textlabel
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={`<font color="#ffffff"><b>Description:</b></font> ${nextGame.roblox.description ?? "None available."}`}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(0.6, 0.6, 0.6)}
			TextSize={36}
			TextWrapped
			RichText
			TextXAlignment={Enum.TextXAlignment.Left}
		/>
		<textlabel
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={`<font color="#ffffff"><b>Last updated:</b></font> ${updatedAt} (${getParsedTimeAgo(nextGame.roblox.updated)})`}
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
			Text={`<font color="#ffffff"><b>Created:</b></font> ${createdAt} (${getParsedTimeAgo(nextGame.roblox.created)})`}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(0.6, 0.6, 0.6)}
			TextSize={36}
			TextWrapped
			TextXAlignment={Enum.TextXAlignment.Left}
			RichText
		/>
	</>;
}

function GameMediaDisplay({ media }: { media: RouletteGame["media"] }) {
	return <scrollingframe
		BackgroundTransparency={1}
		BorderSizePixel={0}
		AutomaticCanvasSize={Enum.AutomaticSize.X}
		CanvasSize={UDim2.fromScale(0, 1)}
		ScrollingDirection={Enum.ScrollingDirection.X}
	>
		<uilistlayout
			HorizontalAlignment={Enum.HorizontalAlignment.Center}
			VerticalAlignment={Enum.VerticalAlignment.Top}
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

function NoGameDisplay() {
	return <textlabel
		Size={UDim2.fromScale(1, 1)}
		BackgroundTransparency={1}
		Text="Loading new game..."
		FontFace={Font.fromId(12187365364)}
		TextColor3={new Color3(0.6, 0.6, 0.6)}
		TextSize={72}
		TextWrapped
	/>
}

function TeleportFailedDisplay() {
	return <textlabel
		Size={UDim2.fromScale(1, 1)}
		BackgroundTransparency={1}
		Text="Failed to teleport players."
		FontFace={Font.fromId(12187365364)}
		TextColor3={Color3.fromHex("ff5555")}
		TextSize={72}
		TextWrapped
	/>
}

export default function App() {
	const [currentGame, setCurrentGame] = React.useState<RouletteGame | undefined>(undefined);
	const [lastGame, setLastGame] = React.useState<RouletteGame | undefined>(undefined);
	const [failed, setFailed] = React.useState(false);

	useEffect(() => {
		if (lastGame) {
			try {
				teleportPlayers(lastGame?.roblox.rootPlaceId);
			} catch (e) {
				warn(e);

				setFailed(true);
			}
		} else setFailed(false);
	}, [lastGame]);

	useEffect(() => {
		if (currentGame) Promise.delay(5).then(() => setCurrentGame(undefined)); // Refresh game info every 5 seconds
	}, [currentGame]);

	useEffect(() => {
		if (currentGame === undefined) getGame().then(nextGame => setCurrentGame(nextGame));
	}, [currentGame]);

	useEffect(() => {
		setLastGame(currentGame);
	}, [currentGame]);

	const scrollRef = useRef<ScrollingFrame>();
	const containerRef = useRef<Frame>();

	useEffect(() => {
		const conn = containerRef.current?.GetPropertyChangedSignal("AbsoluteSize").Connect(() => {
			const height = containerRef.current!.AbsoluteSize.Y + 64; // Add some padding

			scrollRef.current!.CanvasSize = UDim2.fromOffset(0, height); // Update the canvas size to fit the content
		});

		return () => conn?.Disconnect();
	}, [containerRef.current]);

	return <surfacegui
		SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
		PixelsPerStud={48}
	>
		<scrollingframe
			Size={UDim2.fromScale(1, 1)}
			BackgroundColor3={new Color3(0.2, 0.2, 0.2)}
			CanvasSize={UDim2.fromScale(0, 0)}
			AutomaticCanvasSize={Enum.AutomaticSize.Y}
			BorderSizePixel={0}
			ref={scrollRef}
			ScrollBarThickness={0}
		>
			<frame
				AutomaticSize={Enum.AutomaticSize.Y}
				Size={UDim2.fromScale(1, 0)}
				ref={containerRef}
				BackgroundTransparency={1}
			>
				<uipadding
					PaddingLeft={new UDim(0, 32)}
					PaddingRight={new UDim(0, 32)}
					PaddingTop={new UDim(0, 32)}
					PaddingBottom={new UDim(0, 32)}
				/>
				<uilistlayout
					HorizontalFlex={Enum.UIFlexAlignment.Fill}
					VerticalAlignment={Enum.VerticalAlignment.Top}
					Padding={new UDim(0, 16)}
				/>
				{!failed && currentGame !== undefined && <GameInfo nextGame={currentGame} />}
				{!failed && currentGame === undefined && <NoGameDisplay />}
				{failed && <TeleportFailedDisplay />}
			</frame>
		</scrollingframe>
	</surfacegui>;
}