import { createContext } from "@rbxts/react";
import { RouletteGame } from "./games";

type AppContextType = {
	currentGame: RouletteGame | undefined;
	setCurrentGame: (game: RouletteGame | undefined) => void;
	teleporting: boolean;
	setTeleporting: (teleporting: boolean) => void;
	teleportFailed: boolean;
	setTeleportFailed: (failed: boolean) => void;
}

const AppContext = createContext<AppContextType>({
	currentGame: undefined,
	setCurrentGame: () => {},
	teleporting: false,
	setTeleporting: () => {},
	teleportFailed: false,
	setTeleportFailed: () => {}
});

export default AppContext;