import { createContext } from "react";
import { ActionType, InitialState } from "./types";

export const GlobalStateContext = createContext<InitialState>({
  hasInteractiveParams: false,
  hasSetupBackend: false,
  interactiveParams: { ownerProfileId: "", profileId: "" },
  isAssetAlreadyTaken: false,
  visitor: { isAdmin: false, username: "" },
  world: { dataObject: {} },
});

export const GlobalDispatchContext = createContext<React.Dispatch<ActionType> | null>(null);
