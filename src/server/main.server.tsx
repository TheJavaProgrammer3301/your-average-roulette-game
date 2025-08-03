import React, { StrictMode } from "@rbxts/react";
import { createRoot } from "@rbxts/react-roblox";
import { Workspace } from "@rbxts/services";
import App from "./App";

createRoot(Workspace.WaitForChild("AppContainer")).render(<StrictMode>
	<App />
</StrictMode>);