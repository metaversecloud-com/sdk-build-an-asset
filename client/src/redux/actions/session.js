import { session } from "../reducers/session";
import { push } from "redux-first-history";
import axios from "axios";

export const {
  setVisitor,
  setDroppedAsset,
  setPet,
  setPetAssetOwner,
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

export const executeAction = (action) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/pet/action?${queryParams}`;
    const response = await axios.post(url, { action });

    if (response.status === 200) {
      dispatch(setPet(response?.data?.pet));
      return true;
    }
  } catch (error) {
    dispatch(setError("There was an error while training the pet"));
    if (error.response && error.response.data) {
    } else {
    }
    return false;
  }
};

export const spawnPet = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/pet/spawn?${queryParams}`;
    const response = await axios.post(url);

    if (response.status === 200) {
      dispatch(getPet());
    }
  } catch (error) {
    dispatch(setError("There was an error while spawning the pet"));
    if (error.response && error.response.data) {
    } else {
    }
    return false;
  }
};

export const pickupPet = (isSpawnedDroppedAsset) => async (dispatch) => {
  try {
    console.log("isSpawnedDroppedAsset pickupPet", isSpawnedDroppedAsset);
    const queryParams = getQueryParams();
    // isSpawnedDroppedAsset is a variable that shows if the asset being pickup is the spawned asset (like dragon). If it's empty or undefined, it's value is the Pet House.
    const url = `/backend/pet/pickup?${queryParams}&isSpawnedDroppedAsset=${isSpawnedDroppedAsset}`;
    const response = await axios.post(url);

    if (response.status === 200) {
      dispatch(getPet());
    }
  } catch (error) {
    dispatch(setError("There was an error while spawning the pet"));
    if (error.response && error.response.data) {
    } else {
    }
    return false;
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

export const getPet = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/pet?${queryParams}`;

    const response = await axios.get(url);
    const pet = response?.data?.pet;
    const visitor = response?.data?.visitor;
    const isPetAssetOwner = response?.data?.isPetAssetOwner;
    if (response.status === 200) {
      if (!pet) {
        return dispatch(push(`/mascot-selector?${queryParams}`));
      }
      dispatch(setPet(pet));
      dispatch(setVisitor(visitor));
      dispatch(setPetAssetOwner(isPetAssetOwner));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const createPet = (petType, name) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/pet?${queryParams}`;

    const response = await axios.post(url, { petType, name });
    const pet = response?.data?.pet;
    if (response.status === 200) {
      if (!pet) {
        return dispatch(push(`/mascot-selector?${queryParams}`));
      }
      dispatch(setPet(response?.data?.pet));
      return dispatch(push(`/?${queryParams}`));
    }
  } catch (error) {
    console.error("error", error);
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const namePet = (name) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/pet/name?${queryParams}`;

    const response = await axios.post(url, { name });
    const pet = response?.data?.pet;
    if (response.status === 200) {
      if (!pet) {
        return dispatch(push(`/mascot-selector?${queryParams}`));
      }
      dispatch(setPet(response?.data?.pet));
      return dispatch(push(`/?${queryParams}`));
    }
  } catch (error) {
    console.error("Error Naming the pet", JSON.stringify(error));
    if (error.response && error.response.data) {
    } else {
    }
  }
};

export const deleteAll = () => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const url = `/backend/pet?${queryParams}`;

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
