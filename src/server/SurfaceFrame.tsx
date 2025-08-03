import React from "@rbxts/react";
import { createPortal } from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";

export function Divider() {
	return <frame Size={UDim2.fromOffset(0, 32)} BackgroundTransparency={1}>
		<frame Size={new UDim2(1, 0, 0, 1)} AnchorPoint={new Vector2(0.5, 0.5)} Position={UDim2.fromScale(0.5, 0.5)} BorderSizePixel={0} BackgroundColor3={new Color3(0.5, 0.5, 0.5)} />
	</frame>;
}

export default function SurfaceFrame({ cframe, size, children }: { cframe: CFrame, size: Vector3, children?: React.ReactNode }) {
	return createPortal(<part
		Transparency={-math.huge}
		Anchored
		CFrame={cframe}
		Size={size}
		Material={Enum.Material.ForceField}
	>
		<surfacegui
			SizingMode={Enum.SurfaceGuiSizingMode.PixelsPerStud}
			PixelsPerStud={48}
			LightInfluence={1}
		>
			<scrollingframe
				Size={UDim2.fromScale(1, 1)}
				BackgroundColor3={new Color3(0.2, 0.2, 0.2)}
				CanvasSize={UDim2.fromScale(0, 0)}
				AutomaticCanvasSize={Enum.AutomaticSize.Y}
				BorderSizePixel={0}
				ScrollBarThickness={0}
			>
				<frame
					AutomaticSize={Enum.AutomaticSize.Y}
					Size={UDim2.fromScale(1, 0)}
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
					{children}
				</frame>
			</scrollingframe>
		</surfacegui>
	</part>, Workspace);
}