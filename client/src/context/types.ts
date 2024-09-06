export const SET_HAS_SETUP_BACKEND = "SET_HAS_SETUP_BACKEND";
export const SET_INTERACTIVE_PARAMS = "SET_INTERACTIVE_PARAMS";
export const SET_ERROR = "SET_ERROR";
export const SET_SPAWN_SUCCESS = "SET_SPAWN_SUCCESS";
export const SET_VISITOR_AND_WORLD = "SET_VISITOR_AND_WORLD";

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
  hasInteractiveParams: boolean;
  hasSetupBackend: boolean;
  interactiveParams: object;
  isAssetAlreadyTaken: boolean;
  visitorIsAdmin: boolean;
  worldDataObject: { [themeName: string]: { [ownerProfileId: string]: { droppedAssetId: string; s3Url: string } } };
}

export type ActionType = {
  type: string;
  payload: {
    interactiveParams?: InteractiveParams;
    error?: string;
    hasSetupBackend?: boolean;
    spawnSuccess?: boolean;
    isAssetSpawnedInWorld?: boolean;
    droppedAsset?: object;
    spawnedAsset?: object;
    userAsset?: object;
    isAssetAlreadyTaken?: boolean;
    visitorIsAdmin?: boolean;
    worldDataObject?: object;
  };
};
