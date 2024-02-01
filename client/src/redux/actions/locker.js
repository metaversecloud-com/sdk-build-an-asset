import { session } from "../reducers/session";
import { push } from "redux-first-history";
import axios from "axios";

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

  return `visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetId}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}&uniqueName=${uniqueName}&profileId=${profileId}&ownerProfileId=${ownerProfileId}&username=${username}`;
};

export const getVisitor = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();

    const response = await axios.get(`/backend/visitor?${queryParams}`);

    if (response.status === 200) {
      dispatch(setVisitor(response.data.visitor));
    }
  } catch (error) {
    dispatch(setError("There was an error when getting the user content."));
  }
};

export const editLocker = (imageInfo) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/locker/asset/spawn?${queryParams}`;
    const response = await axios.put(url, { imageInfo });

    if (response.status === 200) {
      dispatch(setSpawnSuccess(response?.data));
    }
  } catch (error) {
    dispatch(setError("There was an error while spawning the asset"));
    return false;
  }
};

export const redirectToEdit = (visitor) => async (dispatch) => {
  try {
    console.log("hello");
    const queryParams = getQueryParams();

    const { username } = visitor;
    const modifiedName = username.replace(/ /g, "%20");

    const redirectPath = `locker/claimed?visitor-name=${modifiedName}`;

    const fullPath = `/${redirectPath}&${queryParams}&edit=true`;
    return dispatch(push(fullPath));
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const clearLocker =
  (isClearMyLockerFromUnclaimedLocker) => async (dispatch) => {
    try {
      const queryParams = getQueryParams();
      const url = `/backend/locker/clear?${queryParams}`;
      const response = await axios.put(url, {
        isClearMyLockerFromUnclaimedLocker,
      });

      if (response.status === 200) {
        dispatch(setSpawnSuccess(response?.data));
        return dispatch(push(`/locker?${queryParams}`));
      }
    } catch (error) {
      dispatch(setError("There was an error while spawning the asset"));
      return false;
    }
  };

export const clearAllLockers = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/locker/clear-all?${queryParams}`;
    const response = await axios.put(url);

    if (response.status === 200) {
      dispatch(setSpawnSuccess(response?.data));
      return dispatch(push(`/locker?${queryParams}`));
    }
  } catch (error) {
    dispatch(setError("There was an error while spawning the asset"));
    return false;
  }
};

export const spawnFromSpawnedAsset =
  (completeImageName) => async (dispatch) => {
    try {
      const queryParams = getQueryParams();
      const url = `/backend/asset/spawn-from-spawned-asset?${queryParams}`;
      const response = await axios.post(url, { completeImageName });

      if (response.status === 200) {
        dispatch(setSpawnSuccess(response?.data?.spawnSuccess));
      }
    } catch (error) {
      dispatch(setError("There was an error while spawning the asset"));
      return false;
    }
  };

export const getIsMyAssetSpawned = (completeImageName) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/asset/is-my-asset-spawned?${queryParams}`;
    const response = await axios.get(url, { completeImageName });

    if (response.status === 200) {
      dispatch(setIsAssetSpawnedInWorld());
    }
  } catch (error) {
    dispatch(setError("There was an error while spawning the asset"));
    return false;
  }
};

export const pickupAsset = (isSpawnedDroppedAsset) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/asset/pickup?${queryParams}&isSpawnedDroppedAsset=${isSpawnedDroppedAsset}`;
    const response = await axios.post(url);

    if (response.status === 200) {
      dispatch(getAsset());
    }
  } catch (error) {
    dispatch(setError("There was an error while spawning the asset"));
    return false;
  }
};

export const pickUpAllAssets = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/asset/pickup-all-assets?${queryParams}`;
    const response = await axios.post(url);
  } catch (error) {
    dispatch(setError("There was an error while picking up all assets"));
    return false;
  }
};

export const renameLocker = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/locker/rename?${queryParams}`;
    const response = await axios.post(url);
  } catch (error) {
    dispatch(setError("There was an error while picking up all assets"));
    return false;
  }
};

export const moveToAsset = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/locker/move-to-asset?${queryParams}`;

    const response = await axios.post(url);
  } catch (error) {
    console.error("error", error);
  }
};

export const getDroppedAsset = async () => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/locker/dropped-asset?${queryParams}`;

    const response = await axios.get(url);

    return response?.data?.droppedAsset;
  } catch (error) {
    console.error("error", error);
  }
};

export const getWorld = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/locker/world?${queryParams}`;

    const response = await axios.get(url);

    if (response.status === 200) {
      dispatch(setDroppedAssetAndVisitor(response?.data));
    }
  } catch (error) {
    console.error("error", error);
  }
};

export const getAsset = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/asset?${queryParams}`;

    const response = await axios.get(url);
    const asset = response?.data?.asset;
    const visitor = response?.data?.visitor;
    const isAssetAssetOwner = response?.data?.isAssetAssetOwner;
    if (response.status === 200) {
      if (!asset) {
        return dispatch(push(`/mascot-selector?${queryParams}`));
      }
      dispatch(setAsset(asset));
      dispatch(setVisitor(visitor));
      dispatch(setAssetAssetOwner(isAssetAssetOwner));
    }
  } catch (error) {
    console.error("error", error);
  }
};

export const createAsset = (assetType, name) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/asset?${queryParams}`;

    const response = await axios.post(url, { assetType, name });
    const asset = response?.data?.asset;
    if (response.status === 200) {
      if (!asset) {
        return dispatch(push(`/mascot-selector?${queryParams}`));
      }
      dispatch(setAsset(response?.data?.asset));
      return dispatch(push(`/?${queryParams}`));
    }
  } catch (error) {
    console.error("error", error);
  }
};

export const nameAsset = (name) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/asset/name?${queryParams}`;

    const response = await axios.post(url, { name });
    const asset = response?.data?.asset;
    if (response.status === 200) {
      if (!asset) {
        return dispatch(push(`/mascot-selector?${queryParams}`));
      }
      dispatch(setAsset(response?.data?.asset));
      return dispatch(push(`/?${queryParams}`));
    }
  } catch (error) {
    console.error("Error Naming the asset", JSON.stringify(error));
  }
};

export const deleteAll = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/asset?${queryParams}`;

    const response = await axios.delete(url);
    if (response.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("error", error);
  }
};
