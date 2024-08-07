// File: asset.js

import { session } from "../reducers/session";
import { push } from "redux-first-history";
import axios from "axios";
import { getThemeName } from "../../themeData2.js";

if (process.env.LOCALHOST) {
  axios.defaults.baseURL = "http://localhost:3000";
}

export const {
  setVisitor,
  setDroppedAsset,
  setAsset,
  setAssetAssetOwner,
  setDroppedAssetAndVisitor,
  setIsAssetSpawnedInWorld,
  setSpawnSuccess,
  setError,
} = session.actions;

const getQueryParams = () => {
  const queryParameters = new URLSearchParams(window.location.search);
  const visitorId = queryParameters.get("visitorId");
  const interactiveNonce = queryParameters.get("interactiveNonce");
  const assetId = queryParameters.get("assetId");
  const interactivePublicKey = queryParameters.get("interactivePublicKey");
  const urlSlug = queryParameters.get("urlSlug");
  const uniqueName = queryParameters.get("uniqueName");
  const profileId = queryParameters.get("profileId");
  const ownerProfileId = queryParameters.get("ownerProfileId");
  const username = queryParameters.get("username");
  const displayName = queryParameters.get("displayName");
  const identityId = queryParameters.get("identityId");
  const themeName = getThemeName();

  return `visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetId}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}&uniqueName=${uniqueName}&profileId=${profileId}&ownerProfileId=${ownerProfileId}&username=${username}&displayName=${displayName}&identityId=${identityId}&themeName=${themeName}`;
};

export const getVisitor = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();

    const response = await axios.get(`/api/visitor?${queryParams}`);

    if (response.status === 200) {
      dispatch(setVisitor(response.data.visitor));
    }
  } catch (error) {
    dispatch(setError("There was an error when getting the user content."));
  }
};

export const editAsset = (imageInfo) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/api/asset/asset/spawn?${queryParams}`;
    const response = await axios.put(url, { imageInfo });

    if (response.status === 200) {
      dispatch(setSpawnSuccess(response?.data));
    }
  } catch (error) {
    dispatch(setError(`There was an error while spawning the asset`));
    return false;
  }
};

export const claimAsset = (visitor) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();

    const url = `/api/asset/claim?${queryParams}`;
    const response = await axios.post(url);

    if (response.status === 200) {
      const { username } = visitor;
      const modifiedName = username.replace(/ /g, "%20");

      const themeName = getThemeName();

      const redirectPath = `${themeName}/claimed?visitor-name=${modifiedName}`;

      const fullPath = `/${redirectPath}&${queryParams}&edit=true`;
      return dispatch(push(fullPath));
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const clearAssetAsset =
  (isClearAssetFromUnclaimedAsset) => async (dispatch) => {
    try {
      const queryParams = getQueryParams();
      const url = `/api/asset/clear?${queryParams}`;
      const response = await axios.put(url, {
        isClearAssetFromUnclaimedAsset,
      });

      if (response.status === 200) {
        dispatch(setSpawnSuccess(response?.data));
        return dispatch(push(`/asset?${queryParams}`));
      }
    } catch (error) {
      dispatch(setError(`There was an error while clearing the asset`));
      return false;
    }
  };

export const clearAllAssets = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/api/asset/clear-all?${queryParams}`;
    const response = await axios.put(url);

    if (response.status === 200) {
      dispatch(setSpawnSuccess(response?.data));
      return dispatch(push(`/asset?${queryParams}`));
    }
  } catch (error) {
    dispatch(setError(`There was an error while clearing all assets`));
    return false;
  }
};

export const spawnFromSpawnedAsset =
  (completeImageName) => async (dispatch) => {
    try {
      const queryParams = getQueryParams();
      const url = `/api/asset/spawn-from-spawned-asset?${queryParams}`;
      const response = await axios.post(url, { completeImageName });

      if (response.status === 200) {
        dispatch(setSpawnSuccess(response?.data?.spawnSuccess));
      }
    } catch (error) {
      dispatch(setError("There was an error while spawning the asset"));
      return false;
    }
  };

export const moveToAsset = (closeIframeAfterMove) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/api/asset/move-to-asset?${queryParams}`;

    await axios.post(url, { closeIframeAfterMove });
  } catch (error) {
    console.error("error", error);
  }
};

export const getDroppedAsset = async () => {
  try {
    const queryParams = getQueryParams();
    const url = `/api/asset/dropped-asset?${queryParams}`;

    const response = await axios.get(url);

    return response?.data?.droppedAsset;
  } catch (error) {
    console.error("error", error);
  }
};

export const getWorld = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/api/asset/world?${queryParams}`;

    const response = await axios.get(url);

    if (response.status === 200) {
      dispatch(setDroppedAssetAndVisitor(response?.data));
    }
  } catch (error) {
    console.error("error", error);
  }
};
