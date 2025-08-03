import React, { useEffect, useMemo, useState } from "@rbxts/react";
import AppContext from "./AppContext";
import DeveloperStatsDisplay from "./DeveloperStatsDisplay";
import GameInfoDisplay from "./GameInfoDisplay";
import { getGame, RouletteGame } from "./games";
import NoGameDisplay from "./NoGameDisplay";
import SurfaceFrame from "./SurfaceFrame";
import TeleportDisplay from "./TeleportDisplay";
import TeleportingDisplay from "./TeleportingDisplay";

function TeleportFailedDisplay() {
	return <textlabel
		Size={UDim2.fromScale(1, 1)}
		BackgroundTransparency={1}
		Text="Teleport failed"
		FontFace={Font.fromId(12187365364)}
		TextColor3={Color3.fromHex("ff5555")}
		TextSize={72}
		TextWrapped
	/>
}

function WrappedSurfaceFrame({ cframe, size, children }: { cframe: CFrame; size: Vector3; children: React.ReactNode }) {
	const { currentGame, teleporting, teleportFailed } = React.useContext(AppContext);
	
	const derivedChildren = useMemo(() => {
		if (teleportFailed) return <TeleportFailedDisplay />;
		if (teleporting) return <TeleportingDisplay />;
		if (currentGame) return children;

		return <NoGameDisplay />;
	}, [currentGame, teleporting, teleportFailed]);

	return <SurfaceFrame cframe={cframe} size={size}>{derivedChildren}</SurfaceFrame>;
}

export default function App() {
	const [currentGame, setCurrentGame] = useState<RouletteGame | undefined>(undefined);
	const [teleporting, setTeleporting] = useState(false);
	const [teleportFailed, setTeleportFailed] = useState(false);

	useEffect(() => {
		if (currentGame === undefined) getGame().then(nextGame => setCurrentGame(nextGame));
	}, [currentGame]);

	return <AppContext.Provider value={{ currentGame, setCurrentGame, teleporting, setTeleporting, teleportFailed, setTeleportFailed }}>
		<WrappedSurfaceFrame cframe={new CFrame(0, 8, -24).mul(CFrame.fromEulerAnglesXYZ(0, math.pi, 0))} size={new Vector3(16, 16, 2)}>
			<GameInfoDisplay currentGame={currentGame!} />
		</WrappedSurfaceFrame>

		<WrappedSurfaceFrame cframe={new CFrame(-20, 8, -24).mul(CFrame.fromEulerAnglesXYZ(0, math.pi, 0))} size={new Vector3(16, 16, 2)}>
			<DeveloperStatsDisplay currentGame={currentGame!} />
		</WrappedSurfaceFrame>

		<WrappedSurfaceFrame cframe={new CFrame(20, 8, -24).mul(CFrame.fromEulerAnglesXYZ(0, math.pi, 0))} size={new Vector3(16, 16, 2)}>
			<TeleportDisplay currentGame={currentGame!} />
		</WrappedSurfaceFrame>
	</AppContext.Provider>;
}