import { HttpService, MarketplaceService, RunService } from "@rbxts/services";
import { fetch } from "shared/fetch";

const endpoint = RunService.IsStudio() ? "http://localhost:8787" : "https://your-average-roulette.thejavacoder.workers.dev"

export type Game = {
	id: number,
	name: string,
	description: string | null,
	isArchived: boolean,
	rootPlaceId: number,
	privacyType: "Private" | "Public" | "FriendsOnly",
	creatorType: "User",
	creatorTargetId: number,
	creatorName: string,
	created: string,
	updated: string
}

export type GameMedia = {
	assetTypeId: 0,
	assetType: string,
	imageId: string | number,
	videoHash: string,
	videoTitle: string,
	approved: true,
	altText: string,
	videoId: string
}

export type GameVersion = {
	Id: number,
	assetId: number,
	assetVersionNumber: number,
	creatorType: "User",
	creatorTargetId: number,
	creatingUniverseId: number | null,
	created: string,
	isPublished: boolean
}

export type RouletteGame = {
	roblox: Game,
	media: GameMedia[],
	versions: GameVersion[],
	iconId: string;
}

export async function getGame() {
	const data = await fetch(`${endpoint}/roulette`).then(res => res.json()) as RouletteGame;

	const fallbackThumbnail = `rbxthumb://type=GameThumbnail&id=${data.roblox.rootPlaceId}&w=768&h=432`;
	// const productInfo = await fetch(`https://economy.roblox.com/v2/assets/${data.roblox.rootPlaceId}/details`).then(res => res.json()) as {
	// 	IconImageAssetId: number
	// } | undefined;
	const productInfo = MarketplaceService.GetProductInfo(data.roblox.rootPlaceId, Enum.InfoType.Asset) as AssetProductInfo & {
		IconImageAssetId: number
	} | undefined;
	const iconId = (productInfo && productInfo.IconImageAssetId !== 0) ? `rbxthumb://type=GameIcon&id=${data.roblox.rootPlaceId}&w=512&h=512` : fallbackThumbnail;

	data.media = [...data.media, {
		assetTypeId: 0,
		assetType: "Icon",
		imageId: fallbackThumbnail,
		videoHash: "",
		videoTitle: "",
		approved: true,
		altText: "Game Icon",
		videoId: ""
	}];

	return {
		...data,
		iconId
	};
}

export async function updateMetrics(gameId: number, teleports: number, missedTeleports: number, teleportedPlayers: number[], missedPlayers: number[]) {
	await fetch(`${endpoint}/roulette/${gameId}/metrics`, {
		method: "PUT",
		body: HttpService.JSONEncode({
			teleports,
			missedTeleports,
			teleportedPlayers,
			missedPlayers
		})
	});
}

export async function getPlayerMetrics(userId: number): Promise<{ spins: number, teleports: number }> {
	try {
		const data = await fetch(`${endpoint}/metrics/${userId}`).then(res => res.json());

		return data as { spins: number, teleports: number };
	} catch (error) {
		warn(`Failed to fetch player metrics for userId ${userId}: ${error}`);

		return {
			spins: 0,
			teleports: 0
		};
	}
}

export async function getAllHistory(): Promise<