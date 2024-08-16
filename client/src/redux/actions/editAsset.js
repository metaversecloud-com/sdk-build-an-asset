import { session } from "../reducers/session";
import { getThemeName } from "../../themeData2.js";
import axios from "axios";
import { getQueryParams } from "./getQueryParams.js";

export const { setSpawnSuccess, setError } = session.actions;

export const editAsset = (imageInfo) => async (dispatch) => {
  try {
    const queryParams = getQueryParams();
    const themeName = getThemeName();

    let response;
    if (themeName === "snowman") {
      const url = `/api/asset/spawn-snowman?${queryParams}`;
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
