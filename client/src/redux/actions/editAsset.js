import { session } from "../reducers/session";
import { getThemeData, getThemeName } from "../../themeData2.js";
import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";

export const { setSpawnSuccess, setError } = session.actions;

export const editAsset = (imageInfo) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const themeData = getThemeData();

    let response;
    console.log("themeData", themeData);
    if (themeData?.spawnAssetInRandomLocation) {
      const url = `/api/asset/spawn-random-location?${queryParams}`;
      response = await axios.put(url, { imageInfo });
    } else {
      const url = `/api/asset/asset/spawn?${queryParams}`;
      response = await axios.put(url, { imageInfo });
    }

    if (response.status === 200) {
      dispatch(setSpawnSuccess(response?.data));
    }
  } catch (error) {
    dispatch(setError(`There was an error while spawning the asset`));
    return false;
  }
};
