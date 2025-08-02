import Object from "@rbxts/object-utils";
import { Players, TeleportService, Workspace } from "@rbxts/services";

(Workspace.WaitForChild("Teleport") as BasePart).Touched.Connect(() => {});

export function teleportPlayers(gameId: number) {
	const touchers = (Workspace.WaitForChild("Teleport") as BasePart).GetTouchingParts();
	const players = touchers.map(part => Players.GetPlayerFromCharacter(part.FindFirstAncestorWhichIsA("Model"))).filterUndefined().reduce((set, player) => set.add(player), new Set<Player>());

	if (players.size() > 0) TeleportService.TeleportPartyAsync(
		gameId,
		Object.keys(players)
	);
}