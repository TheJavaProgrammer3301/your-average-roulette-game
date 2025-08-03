import React from "@rbxts/react";

export default function TeleportFailedDisplay() {
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