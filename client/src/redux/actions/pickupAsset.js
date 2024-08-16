import { session } from "../reducers/session.js";
import { push } from "redux-first-history";
import { getThemeName } from "../../themeData2.js";
import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";
export const { getAsset, setError } = session.actions;

export const pickupAsset = (isSpawnedDroppedAsset) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    console.log("queryParams", queryParams);
    const url = `/api/asset/pickup?${queryParams}&isSpawnedDroppedAsset=${isSpawnedDroppedAsset}`;
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
