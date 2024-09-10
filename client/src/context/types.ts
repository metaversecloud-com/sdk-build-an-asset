export const SET_HAS_SETUP_BACKEND = "SET_HAS_SETUP_BACKEND";
export const SET_INTERACTIVE_PARAMS = "SET_INTERACTIVE_PARAMS";
export const SET_ERROR = "SET_ERROR";
export const SET_GAME_STATE = "SET_GAME_STATE";

export type InteractiveParams = {
  assetId: string;
  displayName: string;
  identityId: string;
  interactiveNonce: string;
  interactivePublicKey: string;
  isInteractiveIframe?: boolean;
  ownerProfileId?: string;
  profileId: string;
  sceneDropId: string;
  themeName: string;
  uniqueName: string;
  urlSlug: string;
  username: string;
  visitorId: string;
};

export interface InitialState {
  error: string;
  hasInteractiveParams: boolean;
  hasSetupBackend: boolean;
  interactiveParams: InteractiveParams;
  isAssetAlreadyTaken: boolean;
  visitorIsAdmin: boolean;
  worldDataObject: { [themeName: string]: { [ownerProfileId: string]: { droppedAssetId: string; s3Url: string } } };
}

export type ActionType = {
  type: string;
  payload: {
    error?: string;
    droppedAsset?: object;
    hasSetupBackend?: boolean;
    interactiveParams?: InteractiveParams;
    isAssetAlreadyTaken?: boolean;
    visitorIsAdmin?: boolean;
    worldDataObject?: object;
  };
};
