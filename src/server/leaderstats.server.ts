import { Players } from "@rbxts/services";
import { getPlayerMetrics } from "./games";

Players.PlayerAdded.Connect(player => {
	// Initialize leaderstats for the player
	const leaderstats = new Instance("Folder");
	leaderstats.Name = "leaderstats";
	leaderstats.Parent = player;

	// Create a spins value
	const spins = new Instance("IntValue");
	spins.Name = "Spins";
	spins.Value = 0; // Initial spins
	spins.Parent = leaderstats;

	// Create a teleports value
	const teleports = new Instance("IntValue");
	teleports.Name = "Teleports";
	teleports.Value = 0; // Initial teleports
	teleports.Parent = leaderstats;

	getPlayerMetrics(player.UserId).then(metrics => {
		spins.Value = metrics.spins;
		teleports.Value = metrics.teleports;
	}).catch(msg => {
		warn(`Failed to fetch player metrics for ${player.Name}: ${msg}`);
	});
});