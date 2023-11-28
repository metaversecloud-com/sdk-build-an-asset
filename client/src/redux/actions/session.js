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
  setError,
} = session.actions;

const getQueryParams = () => {
  const queryParameters = new URLSearchParams(window.location.search);
  const visitorId = queryParameters.get("visitorId");
  const interactiveNonce = queryParameters.get("interactiveNonce");
  const assetId = queryParameters.get("assetId");
  const interactivePublicKey = queryParameters.get("interactivePublicKey");
  const urlSlug = queryParameters.get("urlSlug");

  return `visitorId=${visitorId}&interactiveNonce=${interactiveNonce}&assetId=${assetId}&interactivePublicKey=${interactivePublicKey}&urlSlug=${urlSlug}`;
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
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const spawnAsset = (completeImageName) => async (dispatch) => {
  try {
    console.log("completeImageName", completeImageName);
    const queryParams = getQueryParams();
    const url = `/backend/asset/spawn?${queryParams}`;
    const response = await axios.post(url, { completeImageName });

    // if (response.status === 200) {
    //   // dispatch(getAsset());
    // }
  } catch (error) {
    dispatch(setError("There was an error while spawning the asset"));
    if (error.response && error.response.data) {
    } else {
    }
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
    if (error.response && error.response.data) {
    } else {
    }
    return false;
  }
};

export const pickupAsset = (isSpawnedDroppedAsset) => async (dispatch) => {
  try {
    console.log("isSpawnedDroppedAsset pickupAsset", isSpawnedDroppedAsset);
    const queryParams = getQueryParams();
    const url = `/backend/asset/pickup?${queryParams}&isSpawnedDroppedAsset=${isSpawnedDroppedAsset}`;
    const response = await axios.post(url);

    if (response.status === 200) {
      dispatch(getAsset());
    }
  } catch (error) {
    dispatch(setError("There was an error while spawning the asset"));
    if (error.response && error.response.data) {
    } else {
    }
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
    if (error.response && error.response.data) {
    } else {
    }
    return false;
  }
};

export const moveToAsset = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/asset/move-to-asset?${queryParams}`;

    const response = await axios.post(url);
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const getDroppedAsset = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/dropped-asset?${queryParams}`;

    const response = await axios.get(url);

    if (response.status === 200) {
      dispatch(setDroppedAsset(response?.data?.droppedAsset));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const getDroppedAssetAndVisitor = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/dropped-asset-and-visitor?${queryParams}`;

    const response = await axios.get(url);

    if (response.status === 200) {
      dispatch(setDroppedAssetAndVisitor(response?.data));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
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
    if (error.response && error.response.data) {
    } else {
    }
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
    if (error.response && error.response.data) {
    } else {
    }
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
    if (error.response && error.response.data) {
    } else {
    }
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
    if (error.response && error.response.data) {
    } else {
    }
  }
};
