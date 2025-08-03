import React from "@rbxts/react";

export default function NoGameDisplay() {
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