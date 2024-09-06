import { createContext } from "react";
import { ActionType, InitialState } from "./types";

export const GlobalStateContext = createContext<InitialState>({
  hasInteractiveParams: false,
  hasSetupBackend: false,
  interactiveParams: { assetId: "", ownerProfileId: "", profileId: "" },
  isAssetAlreadyTaken: false,
  visitorIsAdmin: false,
  worldDataObject: {},
});

export const GlobalDispatchContext = createContext<React.Dispatch<ActionType> | null>(null);
