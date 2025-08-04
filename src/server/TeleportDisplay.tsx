import React, { useCallback, useContext, useEffect, useRef, useState } from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import { Players, RunService, TeleportService, Workspace } from "@rbxts/services";
import AppContext from "./AppContext";
import { getGame, RouletteGame, updateMetrics } from "./games";
import { Divider } from "./SurfaceFrame";

const TELEPORT_WAIT_TIME = 10;
const FAILED_WAIT_TIME = 2;

function updateStats(player: Player, spins: number, teleports: number) {
	const leaderstats = player.FindFirstChild("leaderstats");

	if (leaderstats) {
		const spinsValue = leaderstats.FindFirstChild("Spins") as IntValue;
		const teleportsValue = leaderstats.FindFirstChild("Teleports") as IntValue;

		if (spinsValue) spinsValue.Value += spins;
		if (teleportsValue) teleportsValue.Value += teleports;
	}
}

function TeleportBox({ players, setPlayers }: { players: Player[], setPlayers: (players: Player[]) => void }) {
	const partRef = useRef<Part>();

	const updatePlayers = useCallback(() => {
		if (!partRef.current) return;

		const touchers = partRef.current.GetTouchingParts();

		const newPlayers = Players.GetPlayers().filter(player => player.Character?.GetDescendants().some(part => touchers.includes(part as BasePart)));

		setPlayers(newPlayers);
	}, [partRef.current]);

	return createPortal(<part
		Color={Color3.fromRGB(2, 207, 135)}
		Material={Enum.Material.ForceField}
		CFrame={new CFrame(0, 6, -14)}
		Size={new Vector3(12, 12, 12)}
		CanCollide={false}
		Anchored
		CanQuery={false}
		ref={partRef}
		Event={{
			Touched: () => updatePlayers(),
			TouchEnded: () => updatePlayers(),
		}}
	/>, Workspace);
}

function PlayerTeleportItem({ player }: { player: Player }) {
	const [thumbnailImage, setThumbnailImage] = useState<string | undefined>(undefined);

	useEffect(() => {
		new Promise<string>(resolve => resolve(Players.GetUserThumbnailAsync(player.UserId, Enum.ThumbnailType.HeadShot, Enum.ThumbnailSize.Size420x420)[0])).then(image => setThumbnailImage(image));
	}, [player]);

	return <frame
		BackgroundTransparency={1}
		Size={UDim2.fromOffset(0, 72)}
	>
		<imagelabel
			Image={thumbnailImage}
			BorderSizePixel={0}
			BackgroundColor3={new Color3(0.25, 0.25, 0.25)}
		>
			<uistroke
				Color={new Color3(0.3, 0.3, 0.3)}
			/>
			<uiaspectratioconstraint
				AspectRatio={1}
				AspectType={Enum.AspectType.ScaleWithParentSize}
				DominantAxis={Enum.DominantAxis.Height}
			/>
			<uicorner
				CornerRadius={new UDim(1, 0)}
			/>
		</imagelabel>
		<textlabel
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={player.Name}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(1, 1, 1)}
			TextSize={56}
			TextWrapped
			TextXAlignment={Enum.TextXAlignment.Left}
		>
			<uiflexitem
				FlexMode={Enum.UIFlexMode.Grow}
			/>
		</textlabel>
		<uilistlayout
			VerticalFlex={Enum.UIFlexAlignment.Fill}
			HorizontalAlignment={Enum.HorizontalAlignment.Left}
			FillDirection={Enum.FillDirection.Horizontal}
			Padding={new UDim(0, 16)}
		/>
	</frame>
}

export default function TeleportDisplay({ currentGame }: { currentGame: RouletteGame }) {
	// players who are going to teleport
	const { teleporting, setTeleporting, teleportFailed, setTeleportFailed, setCurrentGame } = useContext(AppContext);
	const [players, setPlayers] = useState<Player[]>([]);
	const [nextTeleportTime, setNextTeleportTime] = useState<number>(0);
	const titleRef = useRef<TextLabel>();
	const [timeUntilTeleport, setTimeUntilTeleport] = useState<number>(TELEPORT_WAIT_TIME);
	const playersToTeleport = useRef<Player[]>([]);

	useEffect(() => {
		playersToTeleport.current = table.clone(players);
	}, [players]);

	const teleportPlayers = useCallback(async (playersToTeleport: Player[], teleportGame: RouletteGame) => {
		const missedTeleportIds = Players.GetPlayers().map(player => player.UserId).filter(userId => !playersToTeleport.some(p => p.UserId === userId));
		const teleportedIds = playersToTeleport.map(player => player.UserId);

		if (playersToTeleport.size() > 0) TeleportService.TeleportPartyAsync(teleportGame.roblox.rootPlaceId, playersToTeleport);

		await updateMetrics(teleportGame.roblox.id,
			playersToTeleport.size(), Players.GetPlayers().size() - playersToTeleport.size(),
			teleportedIds,
			missedTeleportIds
		);

		Players.GetPlayers().forEach(player => updateStats(player, 1, playersToTeleport.includes(player) ? 1 : 0));
	}, []);

	useEffect(() => {
		if (currentGame) {

			setTimeUntilTeleport(TELEPORT_WAIT_TIME);
			setNextTeleportTime(os.clock() + TELEPORT_WAIT_TIME);

			Promise.delay(TELEPORT_WAIT_TIME).then(async () => {
				const toTeleport = playersToTeleport.current;

				setTeleporting(true);
				setCurrentGame(undefined);

				const teleportGame = currentGame;

				try {
					await teleportPlayers(toTeleport, teleportGame);
				} catch (error) {
					warn(`Failed to teleport players: ${error}`);
					setTeleportFailed(true);

					await Promise.delay(FAILED_WAIT_TIME);

					setTeleportFailed(false);
				} finally {
					setTeleporting(false);
				}
			});
		}
	}, [currentGame]);

	useEffect(() => {
		if (!teleporting && !currentGame) {
			getGame().then(newGame => setCurrentGame(newGame));
		}
	}, [currentGame, teleporting]);

	useEffect(() => {
		const conn = RunService.Heartbeat.Connect(() => setTimeUntilTeleport(math.ceil(math.max(0, nextTeleportTime - os.clock()))));

		return () => conn.Disconnect();
	}, [nextTeleportTime]);

	return <>
		<TeleportBox players={players} setPlayers={setPlayers} />
		<textlabel
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
			Text={`Teleporting in ${timeUntilTeleport} seconds...`}
			FontFace={Font.fromId(12187365364)}
			TextColor3={new Color3(1, 1, 1)}
			TextSize={64}
			TextWrapped
			TextXAlignment={Enum.TextXAlignment.Left}
			ref={titleRef}
		/>
		<Divider />
		<frame
			AutomaticSize={Enum.AutomaticSize.Y}
			BackgroundTransparency={1}
		>
			<uilistlayout
				HorizontalFlex={Enum.UIFlexAlignment.Fill}
				VerticalAlignment={Enum.VerticalAlignment.Top}
				Padding={new UDim(0, 16)}
			/>
			{players.map(player => <PlayerTeleportItem player={player} key={player.UserId} />)}
		</frame>
	</>;
}